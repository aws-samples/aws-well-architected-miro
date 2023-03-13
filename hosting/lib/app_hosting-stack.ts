import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {aws_ecr} from "aws-cdk-lib";

export class AppHostingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //ECR repos for assets (Lambda function containers)
    const repos_list = ['authorize', 'getWorkload', 'getWorkloadList', 'onboard', 'getAnswerslist']
    repos_list.forEach( (repo_name) => {
      const repo = new aws_ecr.Repository(this, repo_name, {
        repositoryName: repo_name.toLowerCase()
      })
    })

  }
}
