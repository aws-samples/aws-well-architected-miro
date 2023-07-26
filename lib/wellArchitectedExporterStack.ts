import * as cdk from 'aws-cdk-lib'
import {
    aws_apigateway,
    aws_cloudfront,
    aws_cloudfront_origins,
    aws_iam,
    aws_s3,
    aws_s3_deployment,
    aws_lambda,
    aws_lambda_nodejs,
    aws_logs,
    Duration,
    aws_secretsmanager,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as path from 'path'

//TODO: Divide CDK code into modules

interface BackendStackProps extends cdk.StackProps {
    readonly clientAppSecret: string
}

export class WellArchitectedExporterStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: BackendStackProps) {
        super(scope, id, props)

        //Bucket for access logs
        const logBucket = new aws_s3.Bucket(this, 'LogBucket', {
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            enforceSSL: true,
			accessControl: aws_s3.BucketAccessControl.LOG_DELIVERY_WRITE
        })

        //Bucket for assets
        const assetsBucket = new aws_s3.Bucket(this, 'AssetsBucket', {
            autoDeleteObjects: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            enforceSSL: true,
            serverAccessLogsBucket: logBucket,
            serverAccessLogsPrefix: 'assetsbucket/',
        })

        //Provision data in assets S3 bucket
        new aws_s3_deployment.BucketDeployment(this, 'BucketDeployment', {
            sources: [
                aws_s3_deployment.Source.asset(
                    path.join(__dirname, '../frontend/dist')
                ),
            ],
            destinationBucket: assetsBucket,
        })

        //TODO: Extract functions and API resources from single data source, iterate over functions, permissions and resources

        //Get list of the Well-Architected Tool workloads function and permissions to WAT
        const workloadListFunction = new aws_lambda_nodejs.NodejsFunction(
            this,
            'WorkloadListFunction',
            {
                entry: path.join(
                    __dirname,
                    '../functions/getWorkloadList/index.ts'
                ),
                architecture: aws_lambda.Architecture.ARM_64,
            }
        )
        workloadListFunction.addToRolePolicy(
            new aws_iam.PolicyStatement({
                actions: [
                    'wellarchitected:ListWorkloads',
                    'wellarchitected:ListLenses',
                    'wellarchitected:GetWorkload',
                ],
                resources: ['*'],
            })
        )

        //Get Well Architected Tool workload content function and permissions to WAT
        const workloadFunction = new aws_lambda_nodejs.NodejsFunction(
            this,
            'WorkloadFunction',
            {
                entry: path.join(
                    __dirname,
                    '../functions/getWorkload/index.ts'
                ),
                architecture: aws_lambda.Architecture.ARM_64,
            }
        )
        workloadFunction.addToRolePolicy(
            new aws_iam.PolicyStatement({
                actions: [
                    'wellarchitected:GetWorkload',
                    'wellarchitected:ListLenses',
                ],
                resources: ['*'],
            })
        )

        const secret = new aws_secretsmanager.Secret(this, 'MiroSecret', {
            secretObjectValue: {
                clientSecret: cdk.SecretValue.unsafePlainText(
                    props.clientAppSecret
                ),
            },
        })

        //API GW authorizer function and permissions to get parameters from Parameter Store
        const apiGatewayAuthFunction = new aws_lambda_nodejs.NodejsFunction(
            this,
            'APIGatewayAuthFunction',
            {
                entry: path.join(__dirname, '../functions/authorize/index.ts'),
                architecture: aws_lambda.Architecture.ARM_64,
                environment: {
                    SECRET_ID: secret.secretName,
                },
            }
        )

        //Permissions for auth function to read Miro Team ID value from SSM Parameter
        secret.grantRead(apiGatewayAuthFunction)

        //Get Well Architected Tool answers for workload
        const answersListFunction = new aws_lambda_nodejs.NodejsFunction(
            this,
            'AnswersListFunction',
            {
                entry: path.join(
                    __dirname,
                    '../functions/getAnswersList/index.ts'
                ),
                architecture: aws_lambda.Architecture.ARM_64,
            }
        )
        answersListFunction.addToRolePolicy(
            new aws_iam.PolicyStatement({
                actions: [
                    'wellarchitected:GetAnswer',
                    'wellarchitected:ListAnswers',
                ],
                resources: ['*'],
            })
        )

        //Log group for API Gateway
        const apiLogGroup = new aws_logs.LogGroup(this, 'ApiGatewayLogs', {
            retention: aws_logs.RetentionDays.ONE_MONTH,
        })

        //API Gateway
        const apiGateway = new aws_apigateway.RestApi(this, 'ApiGateway', {
            restApiName: 'BackendGateway',
            endpointConfiguration: {
                types: [aws_apigateway.EndpointType.REGIONAL],
            },
            deployOptions: {
                accessLogDestination: new aws_apigateway.LogGroupLogDestination(
                    apiLogGroup
                ),
                accessLogFormat:
                    aws_apigateway.AccessLogFormat.jsonWithStandardFields(),
            },
            cloudWatchRole: true,
        })
        //Create API GW root path with region
        const resourceRegion = apiGateway.root
            .addResource('api')
            .addResource('{region}')

        //Create API GW authorizer for header
        const authorizer = new aws_apigateway.RequestAuthorizer(
            this,
            'APIGatewayAuthorizer',
            {
                handler: apiGatewayAuthFunction,
                identitySources: [
                    aws_apigateway.IdentitySource.header('Authorization'),
                ],
                resultsCacheTtl: Duration.seconds(0),
            }
        )

        //Resource and method to get workflows list from Well-Architected Tool
        const resourceGetWorkloadsList =
            resourceRegion.addResource('get-workloads-list')
        resourceGetWorkloadsList.addMethod(
            'GET',
            new aws_apigateway.LambdaIntegration(workloadListFunction),
            {
                authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
                authorizer: authorizer,
            }
        )
        //Resource and method to get workload details
        const resourceGetWorkload = resourceRegion
            .addResource('get-workload')
            .addResource('{workloadId}')
        resourceGetWorkload.addMethod(
            'GET',
            new aws_apigateway.LambdaIntegration(workloadFunction),
            {
                authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
                authorizer: authorizer,
            }
        )
        //Resource and method to get answers from WA workload
        const resourceGetAnswers = resourceRegion
            .addResource('get-answers')
            .addResource('{workloadId}')
            .addResource('lens')
            .addResource('{lens}')
        resourceGetAnswers.addMethod(
            'GET',
            new aws_apigateway.LambdaIntegration(answersListFunction),
            {
                authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
                authorizer: authorizer,
            }
        )

        //CloudFront distribution for assets and API
        const distribution = new aws_cloudfront.Distribution(
            this,
            'CfDistribution',
            {
                enableLogging: true,
                logBucket: logBucket,
                logIncludesCookies: true,
                logFilePrefix: 'cloudfront/',
                defaultRootObject: 'index.html',
                defaultBehavior: {
                    origin: new aws_cloudfront_origins.S3Origin(assetsBucket),
                    allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_ALL,
                    responseHeadersPolicy:
                        aws_cloudfront.ResponseHeadersPolicy
                            .CORS_ALLOW_ALL_ORIGINS,
                },
                additionalBehaviors: {
                    'api/*': {
                        origin: new aws_cloudfront_origins.RestApiOrigin(
                            apiGateway
                        ),
                        allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_ALL,
                        cachePolicy: new aws_cloudfront.CachePolicy(
                            this,
                            'CachePolicy',
                            {
                                defaultTtl: cdk.Duration.seconds(0),
                                minTtl: cdk.Duration.seconds(0),
                                maxTtl: cdk.Duration.seconds(1),
                                headerBehavior:
                                    aws_cloudfront.CacheHeaderBehavior.allowList(
                                        'Authorization'
                                    ),
                            }
                        ),
                    },
                },
            }
        )

        new cdk.CfnOutput(this, 'DistributionOutput', {
            exportName: 'DistributionURL',
            value: distribution.distributionDomainName,
        })

        new cdk.CfnOutput(this, 'clientAppSecret', {
            exportName: 'SecretId',
            value: secret.secretName,
        })
    }
}
