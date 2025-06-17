import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { S3StaticWebsiteOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { RestApiService } from "../constructs";

export class TranslatorService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create policy statement to allow to access the Amazon Translate's TranslateText API
    // to attached to the lambda
    const translateServicePolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });

    // Create policy statement to grant permission to perform PutItem/Scan/GetItem/DeleteItem operations on DynamoDB resources
    const translateTablePolicy = new iam.PolicyStatement({
      actions: [
        "dynamodb:PutItem",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
      ],
      resources: ["*"],
    });

    //Project paths
    const monorepoRoot = path.join(__dirname, "../../");

    const translateLambdaPath = path.join(
      monorepoRoot,
      "packages",
      "lambdas",
      "translate",
      "index.ts"
    );

    const lambdaLayersDirPath = path.join(
      monorepoRoot,
      "packages",
      "lambda-layers"
    );

    const domain = "yourDomain.com"; // add your own domain (e.g.: mydomain.com)
    const fullUrl = `www.${domain}`;
    const apiUrl = `api.${domain}`; // custom url for the API Gateway

    // Fetch Route53 hosted zone by domain name
    const zone = route53.HostedZone.fromLookup(this, "zone", {
      domainName: domain,
    });

    // Create an ACM certificate for the domain and www subdomain with DNS validation in Route 53
    const certificate = new acm.Certificate(this, "certificate", {
      domainName: domain,
      subjectAlternativeNames: [fullUrl, apiUrl],
      validation: acm.CertificateValidation.fromDns(zone), // Automatically creates the DNS records in Route 53 hosted zone (DNS validation)
    });

    const restAPi = new RestApiService(this, "restApiService", {
      apiUrl,
      certificate,
      zone,
    });

    // DynamoDB construct
    const table = new dynamoDb.Table(this, "translations", {
      tableName: "translation",
      partitionKey: {
        name: "requestId",
        type: dynamoDb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Point to Lambda Layer
    const utilsLambdaLayerPath = path.resolve(
      path.join(lambdaLayersDirPath, "utils-lambda-layer")
    );

    // Lambda Layer construct
    const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
      code: lambda.Code.fromAsset(utilsLambdaLayerPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda function that performs translation
    const translateLambda = new lambdaNodeJs.NodejsFunction(
      this,
      "translateLambda",
      {
        projectRoot: monorepoRoot,
        entry: translateLambdaPath,
        handler: "translate",
        runtime: lambda.Runtime.NODEJS_20_X,
        initialPolicy: [translateServicePolicy, translateTablePolicy], // grant lambda the permissions defined in these policies to interact w/Amazon Translate and DynamoDB
        layers: [utilsLambdaLayer],
        environment: {
          TRANSLATION_TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );

    restAPi.addTranslateMethod({
      httpMethod: "POST",
      lambda: translateLambda,
    });

    // Lambda function that retrieves translations
    const getTranslationsLambda = new lambdaNodeJs.NodejsFunction(
      this,
      "getTranslationsLambda",
      {
        projectRoot: monorepoRoot,
        entry: translateLambdaPath,
        handler: "getTranslations",
        runtime: lambda.Runtime.NODEJS_20_X,
        initialPolicy: [translateTablePolicy],
        layers: [utilsLambdaLayer],
        environment: {
          TRANSLATION_TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );

    restAPi.addTranslateMethod({
      httpMethod: "GET",
      lambda: getTranslationsLambda,
    });

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

    // Output CloudFront distribution domain URL for easy access to the deployed website
    new cdk.CfnOutput(this, "webUrl", {
      exportName: "webUrl",
      value: `https://${distro.distributionDomainName}`,
    });
  }
}
