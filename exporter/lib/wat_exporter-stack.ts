import * as cdk from 'aws-cdk-lib';
import {
    aws_apigateway,
    aws_cloudfront,
    aws_cloudfront_origins,
    aws_ecr,
    aws_iam,
    aws_lambda, aws_logs,
    aws_s3, aws_s3_deployment, Duration
} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as path from 'path';

export class WatExporterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

      //Get AWS account ID and region
      const accountId = '711697081313' //TODO: Replace with this.account, requires fix for Lambdas ECR repo (ARN->Name), as repositoryArn is a late-bound value
      const region = 'eu-north-1' //TODO: Replace with this.account, requires fix for Lambdas ECR repo (ARN->Name), as repositoryArn is a late-bound value

      //Bucket for assets
      const assets_bucket = new aws_s3.Bucket(this,'AssetsBucket', {
          bucketName: 'board-wat-integration-app',
          autoDeleteObjects: true,
          removalPolicy: cdk.RemovalPolicy.DESTROY
      })

/*      const functions: { [index: string]: any; } = {
          'WorkloadListFunction': 'wellarchitected',
          'WorkloadFunction': 'wellarchitected',
          'UserOnboardFunction': 'ssm',
          'APIGWauthFunction': 'ssm',
          'AnswersListFunction': 'wellarchitected'
      } */
      //TODO: Extract functions and API resources creation, iterate over functions, permissions and resources

      //Get list of the Well-Architected Tool workloads function and permissions to WAT
      const fn_wl_list = new aws_lambda.Function(this, 'WorkloadListFunction', {
          functionName: 'WorkloadListFunction',
          runtime: aws_lambda.Runtime.FROM_IMAGE,
          architecture: aws_lambda.Architecture.ARM_64,
          code: aws_lambda.Code.fromEcrImage(aws_ecr.Repository.fromRepositoryArn(this, 'repoWorkloadList',
              `arn:aws:ecr:${region}:${accountId}:repository/getworkloadlist`)),
          handler: aws_lambda.Handler.FROM_IMAGE
      })
      fn_wl_list.addToRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ["wellarchitected:*"], //TODO: Replace with fine-grained access control (Get WL list only)
              resources: ['*'],
          })
      )

      //Get Well Architected Tool workload content function and permissions to WAT
      const fn_wl = new aws_lambda.Function(this, 'WorkloadFunction', {
          functionName: 'WorkloadFunction',
          runtime: aws_lambda.Runtime.FROM_IMAGE,
          architecture: aws_lambda.Architecture.ARM_64,
          code: aws_lambda.Code.fromEcrImage(aws_ecr.Repository.fromRepositoryArn(this, 'repoWorkload',
              `arn:aws:ecr:${region}:${accountId}:repository/getworkload`)),
          handler: aws_lambda.Handler.FROM_IMAGE
      })
      fn_wl.addToRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ["wellarchitected:*"], //TODO: Replace with fine-grained access control (Get WL only)
              resources: ['*'],
          })
      )

      //Onboard backend user function and permissions to put parameters to Parameter Store
      const fn_user_onboard = new aws_lambda.Function(this, 'UserOnboardFunction', {
          functionName: 'UserOnboardFunction',
          runtime: aws_lambda.Runtime.FROM_IMAGE,
          architecture: aws_lambda.Architecture.ARM_64,
          code: aws_lambda.Code.fromEcrImage(aws_ecr.Repository.fromRepositoryArn(this, 'repoUserOnboard',
              `arn:aws:ecr:${region}:${accountId}:repository/onboard`)),
          handler: aws_lambda.Handler.FROM_IMAGE
      })
      fn_user_onboard.addToRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ["ssm:*"], //TODO: Replace with fine-grained access to PutParameter only after tests
              resources: ['*'],
          })
      )

      //API GW authorizer function and permissions to get parameters from Parameter Store
      const fn_apigw_auth = new aws_lambda.Function(this, 'APIGWauthFunction', {
          functionName: 'APIGWauthFunction',
          runtime: aws_lambda.Runtime.FROM_IMAGE,
          architecture: aws_lambda.Architecture.ARM_64,
          code: aws_lambda.Code.fromEcrImage(aws_ecr.Repository.fromRepositoryArn(this, 'repoApiGwAuth',
              `arn:aws:ecr:${region}:${accountId}:repository/authorize`)),
          handler: aws_lambda.Handler.FROM_IMAGE
      })
      fn_apigw_auth.addToRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ["ssm:*"], //TODO: Replace with fine-grained access to GetParameter only after tests
              resources: ['*'],
          })
      )

      //Get Well Architected Tool answers for workload
      const fn_answers = new aws_lambda.Function(this, 'AnswersListFunction', {
          functionName: 'AnswersListFunction',
          runtime: aws_lambda.Runtime.FROM_IMAGE,
          architecture: aws_lambda.Architecture.ARM_64,
          code: aws_lambda.Code.fromEcrImage(aws_ecr.Repository.fromRepositoryArn(this, 'repoAnswers',
              `arn:aws:ecr:${region}:${accountId}:repository/getanswerslist`)),
          handler: aws_lambda.Handler.FROM_IMAGE
      })
      fn_answers.addToRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ["wellarchitected:*"], //TODO: Replace with fine-grained access control (Get WL only)
              resources: ['*'],
          })
      )

      //API Gateway
      const api_gw = new aws_apigateway.RestApi(this, 'ApiGateway', {
          restApiName: "BackendGateway",
          endpointConfiguration: {types: [aws_apigateway.EndpointType.REGIONAL]},
          cloudWatchRole: true,
          deployOptions: { //TODO: remove after debugging
              loggingLevel: aws_apigateway.MethodLoggingLevel.INFO,
              dataTraceEnabled: true,
              accessLogDestination: new aws_apigateway.LogGroupLogDestination(new aws_logs.LogGroup(this, 'AccessLogsBackendAPIGW'))
          }
      })
      //Create API GW root path with region
      const rs_region = api_gw.root.addResource('api').addResource('{region}')

      // Test API GW resource and method to troubleshoot CF integration TODO: Delete
      const rs_test = rs_region.addResource('test')
      rs_test.addMethod('GET', )


      //Create API GW authorizer for header
      const authorizer = new aws_apigateway.RequestAuthorizer(this, 'APIGWauthorizer', {
          handler: fn_apigw_auth,
          identitySources: [aws_apigateway.IdentitySource.header('Authorization')],
          resultsCacheTtl: Duration.seconds(0)
      })
      //Resource and method to get workflows list from Well-Architected Tool
      const rs_wl_list = rs_region.addResource('get_wl_list', {
          defaultCorsPreflightOptions: {
              allowOrigins: aws_apigateway.Cors.ALL_ORIGINS, //TODO: Define proper origins list, like miro.com or remove to use Cloudfront
          }
      })
      rs_wl_list.addMethod('GET', new aws_apigateway.LambdaIntegration(fn_wl_list), {
          authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
          authorizer: authorizer
      })
      //Resource and method to get workflow details
      const rs_wl = rs_region.addResource('get_wl').addResource('{workloadId}', {
          defaultCorsPreflightOptions: {
              allowOrigins: aws_apigateway.Cors.ALL_ORIGINS, //TODO: Define proper origins list, like miro.com  or remove to use Cloudfront
          }
          })
      rs_wl.addMethod('GET',new aws_apigateway.LambdaIntegration(fn_wl), {
          authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
          authorizer: authorizer
      })
      //Resource and method to onboard user
      const rs_user_onboard = rs_region.addResource('onboard',{
          defaultCorsPreflightOptions: {
              allowOrigins: aws_apigateway.Cors.ALL_ORIGINS, //TODO: Define proper origins list, like miro.com  or remove to use Cloudfront
          }
          })
      rs_user_onboard.addMethod('POST', new aws_apigateway.LambdaIntegration(fn_user_onboard))
      //Resource and method to get answers from WAT workflow
      const rs_answers = rs_region.addResource('get_answers').addResource('{workloadId}').addResource('lens').addResource('{lens}', {
          defaultCorsPreflightOptions: {
              allowOrigins: aws_apigateway.Cors.ALL_ORIGINS, //TODO: Define proper origins list, like miro.com  or remove to use Cloudfront
          }
          })
      rs_answers.addMethod('GET', new aws_apigateway.LambdaIntegration(fn_answers), {
          authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
          authorizer: authorizer
      })


      //CloudFront distribution for assets and API
      const distribution = new aws_cloudfront.Distribution(this, 'CfDistribution', {
          logBucket: aws_s3.Bucket.fromBucketName(this, 'CloudFrontLogsBucket', 'board-wat-cf-logs'),
          defaultBehavior: {
              origin: new aws_cloudfront_origins.S3Origin(assets_bucket),
              allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_ALL,
          },
          additionalBehaviors: {
              'api/*': {
                  origin: new aws_cloudfront_origins.RestApiOrigin(api_gw),
                  allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_ALL,
                  cachePolicy: new aws_cloudfront.CachePolicy(this, 'CachePolicy', {
                      defaultTtl: cdk.Duration.seconds(0),
                      minTtl: cdk.Duration.seconds(0),
                      maxTtl: cdk.Duration.seconds(1),
                      headerBehavior: aws_cloudfront.CacheHeaderBehavior.allowList('Authorization')
                  })
                  }
          }
      })

      //Provision data in S3 bucket
      new aws_s3_deployment.BucketDeployment(this, 'BucketDeployment', {
          sources: [aws_s3_deployment.Source.asset(path.join(__dirname, '../../frontend/src'))],
          destinationBucket: assets_bucket
      })

      new cdk.CfnOutput(this, 'DistributionOutput', {
          exportName: 'DistributionURL',
          value: distribution.distributionDomainName
      })
  }
}
