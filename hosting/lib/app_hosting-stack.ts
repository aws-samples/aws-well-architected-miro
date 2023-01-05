import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {aws_cloudfront, aws_ecr, aws_ecs, aws_iam, aws_s3, CfnOutput} from "aws-cdk-lib";

export class AppHostingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Bucket for assets
    const assets_bucket = new aws_s3.Bucket(this,'AssetsBucket', {
      bucketName: 'board-wat-integration-app'
    })

    //CloudFront distribution for assets
    const assets_distribution = new aws_cloudfront.CloudFrontWebDistribution(this, 'AssetsDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: assets_bucket,
            originAccessIdentity: new aws_cloudfront.OriginAccessIdentity(this, 'AssetsOAI')
        },
          behaviors: [ {isDefaultBehavior: true}],
        }
    ]
    }
    )

    //ECR repos for assets
    const repos_list = ['authorize', 'getworkflow', 'getworkflowlist', 'onboard', 'getanswerslist']
    repos_list.forEach( (repo_name) => {
      const repo = new aws_ecr.Repository(this, repo_name, {
        repositoryName: repo_name
      })
      repo.grantPull(new aws_iam.AccountPrincipal('201316940481'))
    })


    new CfnOutput(this, 'DistributionOutput', {
      exportName: 'DistributionURL',
      value: assets_distribution.distributionDomainName
    })
  }
}
