import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {aws_apigateway, aws_iam, aws_lambda} from "aws-cdk-lib";
import {readFileSync} from "fs";

export class WatExporterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

      //Get list of the Well-Architected Tool workflows function and permissions to WAT
      const code_wf_list = readFileSync('lambdas/wf_list/lambda.js', 'utf8')
      const fn_wf_list = new aws_lambda.Function(this, 'WorkflowsListFunction', {
          functionName: 'WorkflowsListFunction',
          runtime: aws_lambda.Runtime.NODEJS_16_X,
          code: aws_lambda.Code.fromInline(code_wf_list),
          handler: 'handler'
      })
      fn_wf_list.addToRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ["wellarchitected:*"],
              resources: ['*'],
          })
      )

      //Get Well Architected Tool workflow content function and permissions to WAT
      const code_wf = readFileSync('lambdas/wf/lambda.js', 'utf8')
      const fn_wf = new aws_lambda.Function(this, 'WorkflowFunction', {
          functionName: 'WorkflowFunction',
          runtime: aws_lambda.Runtime.NODEJS_16_X,
          code: aws_lambda.Code.fromInline(code_wf),
          handler: 'handler'
      })
      fn_wf.addToRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ["wellarchitected:*"],
              resources: ['*'],
          })
      )

      //Onboard backend user function and permissions to put parameters to Parameter Store
      const code_user_onboard = readFileSync('lambdas/onboard/lambda.js', 'utf8')
      const fn_user_onboard = new aws_lambda.Function(this, 'UserOnboardFunction', {
          functionName: 'UserOnboardFunction',
          runtime: aws_lambda.Runtime.NODEJS_16_X,
          code: aws_lambda.Code.fromInline(code_user_onboard),
          handler: 'handler'
      })
      fn_user_onboard.addToRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ["ssm:*"], //TODO: Replace with fine-grained access to PutParameter only after tests
              resources: ['*'],
          })
      )

      //API GW authorizer function and permissions to get parameters from Parameter Store
      const code_apigw_auth = readFileSync('lambdas/apigw_auth/lambda.js', 'utf8')
      const fn_apigw_auth = new aws_lambda.Function(this, 'APIGWauthFunction', {
          functionName: 'APIGWauthFunction',
          runtime: aws_lambda.Runtime.NODEJS_16_X,
          code: aws_lambda.Code.fromInline(code_apigw_auth),
          handler: 'handler'
      })
      fn_apigw_auth.addToRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ["ssm:*"], //TODO: Replace with fine-grained access to GetParameter only after tests
              resources: ['*'],
          })
      )

      //API Gateway
      const api_gw = new aws_apigateway.RestApi(this, 'ApiGateway', {
          restApiName: "BackendGateway"
      })
      //Resource and method to get workflows list from Well-Architected Tool
      const rs_wf_list = api_gw.root.addResource('get_wf_list')
      rs_wf_list.addMethod('GET', new aws_apigateway.LambdaIntegration(fn_wf_list))
      //Resource and method to get workflow details
      const rs_wf = api_gw.root.addResource('get_wf')
      rs_wf.addMethod('GET', new aws_apigateway.LambdaIntegration(fn_wf))
      //Resource and method for to onboard user
      const rs_user_onboard = api_gw.root.addResource('onboard')
      rs_wf.addMethod('POST', new aws_apigateway.LambdaIntegration(fn_user_onboard))
  }
}
