import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";

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

    const monorepoRoot = path.join(__dirname, "../../");

    const translateLambdaPath = path.join(
      monorepoRoot,
      "packages",
      "lambdas",
      "translate",
      "index.ts"
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

    // Lambda function that performs translation
    const lambdaFunc = new lambdaNodeJs.NodejsFunction(this, "timeOfDay", {
      projectRoot: monorepoRoot,
      entry: translateLambdaPath,
      handler: "index",
      runtime: lambda.Runtime.NODEJS_20_X,
      initialPolicy: [translateServicePolicy, translateTablePolicy], // grant lambda the permissions defined in these policies to interact w/ Amazon Translate and DynamoDB
      environment: {
        TRANSLATION_TABLE_NAME: table.tableName,
        TRANSLATION_PARTITION_KEY: "requestId",
      },
    });

    // create Rest Api
    const restApi = new apigateway.RestApi(this, "timeOfDayRestAPI");

    // grant read and write access to DynamoDB table
    // table.grantReadWriteData(lambdaFunc);

    restApi.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaFunc)
    );
  }
}
