import * as cdk from 'aws-cdk-lib'
import {
    aws_apigateway,
    aws_cloudfront,
    aws_cloudfront_origins,
    aws_ecr,
    aws_iam,
    aws_lambda,
    aws_s3,
    aws_s3_deployment,
    Duration,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as path from 'path'

export class WatExporterStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        //Bucket for assets
        const assets_bucket = new aws_s3.Bucket(this, 'AssetsBucket', {
            autoDeleteObjects: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        })

        //Provision data in assets S3 bucket
        new aws_s3_deployment.BucketDeployment(this, 'BucketDeployment', {
            sources: [
                aws_s3_deployment.Source.asset(
                    path.join(__dirname, '../../frontend/dist')
                ),
            ],
            destinationBucket: assets_bucket,
        })

        //TODO: Extract functions and API resources from single data source, iterate over functions, permissions and resources

        //Get list of the Well-Architected Tool workloads function and permissions to WAT
        const fn_wl_list = new aws_lambda.Function(
            this,
            'WorkloadListFunction',
            {
                functionName: 'WorkloadListFunction',
                runtime: aws_lambda.Runtime.FROM_IMAGE,
                architecture: aws_lambda.Architecture.ARM_64,
                code: aws_lambda.Code.fromEcrImage(
                    aws_ecr.Repository.fromRepositoryName(
                        this,
                        'repoWorkloadList',
                        `getworkloadlist`
                    )
                ),
                handler: aws_lambda.Handler.FROM_IMAGE,
            }
        )
        fn_wl_list.addToRolePolicy(
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
        const fn_wl = new aws_lambda.Function(this, 'WorkloadFunction', {
            functionName: 'WorkloadFunction',
            runtime: aws_lambda.Runtime.FROM_IMAGE,
            architecture: aws_lambda.Architecture.ARM_64,
            code: aws_lambda.Code.fromEcrImage(
                aws_ecr.Repository.fromRepositoryName(
                    this,
                    'repoWorkload',
                    `getworkload`
                )
            ),
            handler: aws_lambda.Handler.FROM_IMAGE,
        })
        fn_wl.addToRolePolicy(
            new aws_iam.PolicyStatement({
                actions: [
                    'wellarchitected:GetWorkload',
                    'wellarchitected:ListLenses',
                ],
                resources: ['*'],
            })
        )

        //Onboard backend user function and permissions to put parameters to Systems Manager Parameter Store
        const fn_user_onboard = new aws_lambda.Function(
            this,
            'UserOnboardFunction',
            {
                functionName: 'UserOnboardFunction',
                runtime: aws_lambda.Runtime.FROM_IMAGE,
                architecture: aws_lambda.Architecture.ARM_64,
                code: aws_lambda.Code.fromEcrImage(
                    aws_ecr.Repository.fromRepositoryName(
                        this,
                        'repoUserOnboard',
                        `onboard`
                    )
                ),
                handler: aws_lambda.Handler.FROM_IMAGE,
            }
        )
        fn_user_onboard.addToRolePolicy(
            new aws_iam.PolicyStatement({
                actions: [
                    'ssm:PutParameter',
                    'ssm:GetParameter'
                ],
                resources: ['*'], //TODO: Replace with fine-grained access to particular parameter
            })
        )

        //API GW authorizer function and permissions to get parameters from Parameter Store
        const fn_apigw_auth = new aws_lambda.Function(
            this,
            'APIGWauthFunction',
            {
                functionName: 'APIGWauthFunction',
                runtime: aws_lambda.Runtime.FROM_IMAGE,
                architecture: aws_lambda.Architecture.ARM_64,
                code: aws_lambda.Code.fromEcrImage(
                    aws_ecr.Repository.fromRepositoryName(
                        this,
                        'repoApiGwAuth',
                        `authorize`
                    )
                ),
                handler: aws_lambda.Handler.FROM_IMAGE,
            }
        )
        fn_apigw_auth.addToRolePolicy(
            new aws_iam.PolicyStatement({
                actions: ['ssm:GetParameter'],
                resources: ['*'], //TODO: Replace with fine-grained access to particular parameter
            })
        )

        //Get Well Architected Tool answers for workload
        const fn_answers = new aws_lambda.Function(
            this,
            'AnswersListFunction',
            {
                functionName: 'AnswersListFunction',
                runtime: aws_lambda.Runtime.FROM_IMAGE,
                architecture: aws_lambda.Architecture.ARM_64,
                code: aws_lambda.Code.fromEcrImage(
                    aws_ecr.Repository.fromRepositoryName(
                        this,
                        'repoAnswers',
                        `getanswerslist`
                    )
                ),
                handler: aws_lambda.Handler.FROM_IMAGE,
            }
        )
        fn_answers.addToRolePolicy(
            new aws_iam.PolicyStatement({
                actions: [
                    'wellarchitected:GetAnswer',
                    'wellarchitected:ListAnswers',
                ],
                resources: ['*'],
            })
        )

        //API Gateway
        const api_gw = new aws_apigateway.RestApi(this, 'ApiGateway', {
            restApiName: 'BackendGateway',
            endpointConfiguration: {
                types: [aws_apigateway.EndpointType.REGIONAL],
            },
        })
        //Create API GW root path with region
        const rs_region = api_gw.root.addResource('api').addResource('{region}')

        //Create API GW authorizer for header
        const authorizer = new aws_apigateway.RequestAuthorizer(
            this,
            'APIGWauthorizer',
            {
                handler: fn_apigw_auth,
                identitySources: [
                    aws_apigateway.IdentitySource.header('Authorization'),
                ],
                resultsCacheTtl: Duration.seconds(0),
            }
        )

        //Resource and method to get workflows list from Well-Architected Tool
        const rs_wl_list = rs_region.addResource('get_wl_list')
        rs_wl_list.addMethod(
            'GET',
            new aws_apigateway.LambdaIntegration(fn_wl_list),
            {
                authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
                authorizer: authorizer,
            }
        )
        //Resource and method to get workflow details
        const rs_wl = rs_region
            .addResource('get_wl')
            .addResource('{workloadId}')
        rs_wl.addMethod('GET', new aws_apigateway.LambdaIntegration(fn_wl), {
            authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
            authorizer: authorizer,
        })
        //Resource and method to onboard user
        const rs_user_onboard = rs_region.addResource('onboard')
        rs_user_onboard.addMethod(
            'POST',
            new aws_apigateway.LambdaIntegration(fn_user_onboard)
        )
        //Resource and method to get answers from WAT workflow
        const rs_answers = rs_region
            .addResource('get_answers')
            .addResource('{workloadId}')
            .addResource('lens')
            .addResource('{lens}')
        rs_answers.addMethod(
            'GET',
            new aws_apigateway.LambdaIntegration(fn_answers),
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
                defaultRootObject: 'index.html',
                defaultBehavior: {
                    origin: new aws_cloudfront_origins.S3Origin(assets_bucket),
                    allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_ALL,
                    responseHeadersPolicy:
                        aws_cloudfront.ResponseHeadersPolicy
                            .CORS_ALLOW_ALL_ORIGINS,
                },
                additionalBehaviors: {
                    'api/*': {
                        origin: new aws_cloudfront_origins.RestApiOrigin(
                            api_gw
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
    }
}
