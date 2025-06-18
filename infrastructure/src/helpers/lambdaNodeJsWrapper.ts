import path from "path";
import * as fs from "fs";
import { Construct } from "constructs";
import { lambdasDirPath } from "./appPaths";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";

export type LambdaWrapperProps = {
  lambdaRelativePath: string;
  handler: string;
  initialPolicy: Array<iam.PolicyStatement>;
  lambdaLayers: Array<lambda.ILayerVersion>;
  environment: Record<string, string>;
};

const bundling: lambdaNodeJs.BundlingOptions = {
  minify: true,
  externalModules: [
    "opt/nodejs/utils-lambda-layer",
    "@aws-sdk/client-dynamodb",
    "@aws-sdk/util-dynamodb",
  ],
};

export const createNodeJsLambda = (
  scope: Construct,
  lambdaName: string,
  {
    lambdaRelativePath,
    handler,
    initialPolicy,
    lambdaLayers,
    environment,
  }: LambdaWrapperProps
) => {
  const lambdaPath = path.join(lambdasDirPath, lambdaRelativePath); // lambda full path

  if (!fs.existsSync(lambdaPath)) {
    throw new Error(`Lambda entry not found: ${lambdaPath}`);
  }

  return new lambdaNodeJs.NodejsFunction(scope, lambdaName, {
    entry: lambdaPath,
    handler,
    runtime: lambda.Runtime.NODEJS_20_X,
    initialPolicy, // grant lambda the permissions defined in these policies to interact w/Amazon Translate and DynamoDB
    layers: lambdaLayers,
    environment,
    bundling,
  });
};
