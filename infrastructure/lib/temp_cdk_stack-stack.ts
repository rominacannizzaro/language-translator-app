import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";

export class TempCdkStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create policy to allow to access the Amazon Translate's TranslateText API
    // to attached to the lambda
    const translateAccessPolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
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

    // timeOfDay lambda construct
    const lambdaFunc = new lambdaNodeJs.NodejsFunction(this, "timeOfDay", {
      projectRoot: monorepoRoot,
      entry: translateLambdaPath,
      handler: "index",
      runtime: lambda.Runtime.NODEJS_20_X,
      initialPolicy: [translateAccessPolicy],
    });

    // create Rest Api
    const restApi = new apigateway.RestApi(this, "timeOfDayRestAPI");
    restApi.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaFunc)
    );
  }
}
