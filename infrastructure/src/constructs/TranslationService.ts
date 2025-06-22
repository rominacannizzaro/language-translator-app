import * as path from "path";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import { RestApiService } from "./RestApiService";
import {
  createNodeJsLambda,
  lambdaLayersDirPath,
  lambdasDirPath,
} from "../helpers";

export interface TranslationServiceProps extends cdk.StackProps {
  restApi: RestApiService;
}

export class TranslationService extends Construct {
  public restApi: apigateway.RestApi;
  constructor(
    scope: Construct,
    id: string,
    { restApi }: TranslationServiceProps
  ) {
    super(scope, id);

    // Point to Lambda Layer
    const utilsLambdaLayerPath = path.resolve(
      path.join(lambdaLayersDirPath, "utils-lambda-layer")
    );

    // DynamoDB construct
    const table = new dynamoDb.Table(this, "translations", {
      tableName: "translation",
      partitionKey: {
        name: "username",
        type: dynamoDb.AttributeType.STRING,
      },
      sortKey: {
        name: "requestId",
        type: dynamoDb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

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
        "dynamodb:Query", // use Query command to extract the information needed per user
      ],
      resources: ["*"],
    });

    // Lambda Layer construct
    const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
      code: lambda.Code.fromAsset(utilsLambdaLayerPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const environment = {
      TRANSLATION_TABLE_NAME: table.tableName,
      TRANSLATION_PARTITION_KEY: "username",
      TRANSLATION_SORT_KEY: "requestId",
    };

    // Lambda function that performs translation
    const translateLambda = createNodeJsLambda(this, "translateLambda", {
      lambdaRelativePath: "translate/index.ts",
      handler: "userTranslate",
      initialPolicy: [translateServicePolicy, translateTablePolicy], // grant lambda the permissions defined in these policies to interact w/Amazon Translate and DynamoDB
      lambdaLayers: [utilsLambdaLayer],
      environment,
    });

    // Add translateLambda to Rest API
    restApi.addTranslateMethod({
      resource: restApi.userResource,
      httpMethod: "POST",
      lambda: translateLambda,
      isAuth: true,
    });

    // Lambda function that retrieves translations
    const getTranslationsLambda = createNodeJsLambda(
      this,
      "getTranslationsLambda",
      {
        lambdaRelativePath: "translate/index.ts",
        handler: "getUserTranslations",
        initialPolicy: [translateTablePolicy],
        lambdaLayers: [utilsLambdaLayer],
        environment,
      }
    );

    // Add getTranslationsLambda to the Rest API
    restApi.addTranslateMethod({
      resource: restApi.userResource,
      httpMethod: "GET",
      lambda: getTranslationsLambda,
      isAuth: true,
    });

    const publicTranslateLambda = createNodeJsLambda(
      this,
      "publicTranslateLambda",
      {
        lambdaRelativePath: "translate/index.ts",
        handler: "publicTranslate",
        initialPolicy: [translateServicePolicy],
        lambdaLayers: [utilsLambdaLayer],
        environment,
      }
    );

    // Add publicTranslateLambda to the Rest API
    restApi.addTranslateMethod({
      resource: restApi.publicResource,
      httpMethod: "POST",
      lambda: publicTranslateLambda,
      isAuth: false,
    });
  }
}
