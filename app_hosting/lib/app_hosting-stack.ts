import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {aws_cloudfront, aws_s3, CfnOutput} from "aws-cdk-lib";

export class AppHostingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
      const assets_bucket = new aws_s3.Bucket(this,'AssetsBucket', {
        bucketName: 'board-wat-integration-app'
      })

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

      new CfnOutput(this, 'DistributionOutput', {
        exportName: 'DistributionURL',
        value: assets_distribution.distributionDomainName
      })
  }
}
