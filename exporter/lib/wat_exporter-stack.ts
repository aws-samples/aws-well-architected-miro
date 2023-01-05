import * as cdk from 'aws-cdk-lib';
import {aws_apigateway, aws_ecr, aws_iam, aws_lambda} from 'aws-cdk-lib';
import {Construct} from 'constructs';

export class WatExporterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

      //Get list of the Well-Architected Tool workflows function and permissions to WAT
      const fn_wf_list = new aws_lambda.Function(this, 'WorkflowsListFunction', {
          functionName: 'WorkflowsListFunction',
          runtime: aws_lambda.Runtime.NODEJS_16_X,
          code: aws_lambda.Code.fromAsset('functions/getWorkflowList'),
          handler: 'index.handler'
      })
      fn_wf_list.addToRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ["wellarchitected:*"],
              resources: ['*'],
          })
      )

      //Get Well Architected Tool workflow content function and permissions to WAT
      const fn_wf = new aws_lambda.Function(this, 'WorkflowFunction', {
          functionName: 'WorkflowFunction',
          runtime: aws_lambda.Runtime.NODEJS_16_X,
          code: aws_lambda.Code.fromAsset('functions/getWorkflow'),
          handler: 'index.handler'
      })
      fn_wf.addToRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ["wellarchitected:*"],
              resources: ['*'],
          })
      )

      //Onboard backend user function and permissions to put parameters to Parameter Store
      const fn_user_onboard = new aws_lambda.Function(this, 'UserOnboardFunction', {
          functionName: 'UserOnboardFunction',
          runtime: aws_lambda.Runtime.NODEJS_16_X,
          code: aws_lambda.Code.fromAsset('functions/onBoard'),
          handler: 'index.handler'
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
          runtime: aws_lambda.Runtime.NODEJS_16_X,
          code: aws_lambda.Code.fromAsset('functions/authorize'),
          handler: 'index.handler'
      })
      fn_apigw_auth.addToRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ["ssm:*"], //TODO: Replace with fine-grained access to GetParameter only after tests
              resources: ['*'],
          })
      )

      //Get Well Architected Tool answers for workflow
      const fn_answers = new aws_lambda.Function(this, 'AnswersListFunction', {
          functionName: 'AnswersListFunction',
          runtime: aws_lambda.Runtime.FROM_IMAGE,
          architecture: aws_lambda.Architecture.ARM_64,
          // code: aws_lambda.Code.fromAsset('functions/getAnswersList'),
          code: aws_lambda.Code.fromEcrImage(aws_ecr.Repository.fromRepositoryArn(this, 'repoAnswers',
              'arn:aws:ecr:eu-north-1:711697081313:repository/getanswerslist')),
          handler: aws_lambda.Handler.FROM_IMAGE
      })
      fn_answers.addToRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ["wellarchitected:*"],
              resources: ['*'],
          })
      )

      //API Gateway
      const api_gw = new aws_apigateway.RestApi(this, 'ApiGateway', {
          restApiName: "BackendGateway"
      })
      //Create API GW root path with region
      const rs_region = api_gw.root.addResource('{region}')
      //Resource and method to get workflows list from Well-Architected Tool
      const rs_wf_list = rs_region.addResource('get_wl_list', {
          defaultCorsPreflightOptions: {
              allowOrigins: aws_apigateway.Cors.ALL_ORIGINS, //TODO: Define proper origins list, like miro.com
          }
      })
      rs_wf_list.addMethod('GET', new aws_apigateway.LambdaIntegration(fn_wf_list))
      //Resource and method to get workflow details
      const rs_wf = rs_region.addResource('get_wl').addResource('{workloadId}', {
          defaultCorsPreflightOptions: {
              allowOrigins: aws_apigateway.Cors.ALL_ORIGINS, //TODO: Define proper origins list, like miro.com
          }
          })
      rs_wf.addMethod('GET',new aws_apigateway.LambdaIntegration(fn_wf))
      //Resource and method to onboard user
      const rs_user_onboard = rs_region.addResource('onboard',{
          defaultCorsPreflightOptions: {
              allowOrigins: aws_apigateway.Cors.ALL_ORIGINS, //TODO: Define proper origins list, like miro.com
          }
          })
      rs_user_onboard.addMethod('POST', new aws_apigateway.LambdaIntegration(fn_user_onboard), {
          authorizationType: aws_apigateway.AuthorizationType.CUSTOM,
          authorizer: new aws_apigateway.TokenAuthorizer(this, 'WFListAuthorizer', {
              handler: fn_apigw_auth
          })
      })
      //Resource and method to get answers from WAT workflow
      const rs_answers = rs_region.addResource('get_answers').addResource('{workloadId}').addResource('lens').addResource('{lens}', {
          defaultCorsPreflightOptions: {
              allowOrigins: aws_apigateway.Cors.ALL_ORIGINS, //TODO: Define proper origins list, like miro.com
          }
          })
      rs_answers.addMethod('GET', new aws_apigateway.LambdaIntegration(fn_answers))
  }
}
