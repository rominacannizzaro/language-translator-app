import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as s3 from "aws-cdk-lib/aws-s3";
import { S3StaticWebsiteOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

export interface StaticWebsiteDeploymentProps extends cdk.StackProps {
  domain: string;
  fullUrl: string;
  certificate: acm.Certificate;
  zone: route53.IHostedZone;
}

export class StaticWebsiteDeployment extends Construct {
  public restApi: apigateway.RestApi;
  constructor(
    scope: Construct,
    id: string,
    { domain, fullUrl, certificate, zone }: StaticWebsiteDeploymentProps
  ) {
    super(scope, id);

    // s3 bucket where webiste dist will reside
    const bucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html", // default page to serve when a user accesses the root of the site
      websiteErrorDocument: "404.html", // page to serve when a 404 (not found) error occurs
      publicReadAccess: true, // allow public read access to all objects in the bucket
      // blockPublicAccess settings to make the bucket public (since the default blocks public access)
      blockPublicAccess: {
        blockPublicAcls: false, // allow ACLs (Access Control Lists) to be set publicly
        blockPublicPolicy: false, // allow bucket policies that make the bucket public
        ignorePublicAcls: false, // allow ACLs to take effect (do not ignore them)
        restrictPublicBuckets: false, // allow the bucket to be publicly accessible
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // delete bucket automatically when the stack is destroyed
      autoDeleteObjects: true, // delete all objects automatically when the bucket is deleted
    });

    // Create CloudFront distribution to serve the website files from the S3 bucket
    const distro = new cloudfront.Distribution(this, "WebsiteCloudfrontDist", {
      defaultBehavior: {
        origin: new S3StaticWebsiteOrigin(bucket),
      },
      certificate: certificate, // Attach the ACM certificate to CloudFront to enable HTTPS for the custom domain names
      domainNames: [domain, fullUrl],
    });

    // s3 construct to deploy the website dist content
    new s3deploy.BucketDeployment(this, "WebsiteDeploy", {
      destinationBucket: bucket,
      sources: [s3deploy.Source.asset("../apps/frontend/dist")],
      distribution: distro,
      distributionPaths: ["/*"],
    });

    // Create two Route 53 A records for the domain and full URL to route traffic to the CloudFront distribution
    new route53.ARecord(this, "route53Domain", {
      zone,
      recordName: domain,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distro)
      ),
    });

    new route53.ARecord(this, "route53FullUrl", {
      zone,
      recordName: "www",
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distro)
      ),
    });
  }
}
