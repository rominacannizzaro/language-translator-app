import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
export class TempCdkStackStack extends cdk.Stack {
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

    // Create top level Rest Api
    const restApi = new apigateway.RestApi(this, "timeOfDayRestAPI");

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

    restApi.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(translateLambda)
    );

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

    restApi.root.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getTranslationsLambda)
    );

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

    // s3 construct to deploy the website dist content
    new s3deploy.BucketDeployment(this, "WebsiteDeploy", {
      destinationBucket: bucket,
      sources: [s3deploy.Source.asset("../apps/frontend/dist")],
    });
  }
}
