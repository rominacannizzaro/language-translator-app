import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs'; 
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

export class TempCdkStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create policy to allow to access the Amazon Translate's TranslateText API
    // to attached to the lambda
    const translateAccessPolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    })

    // timeOfDay lambda construct
    const lambdaFunc = new lambdaNodeJs.NodejsFunction(this, "timeOfDay", {
      entry: "./lambda/timeOfDay.ts",
      handler: "index",
      runtime: lambda.Runtime.NODEJS_20_X,
      initialPolicy: [translateAccessPolicy],
    });

    // create Rest Api
    const restApi = new apigateway.RestApi(this, "timeOfDayRestAPI");
    restApi.root.addMethod("GET", new apigateway.LambdaIntegration(lambdaFunc));
  }
}
