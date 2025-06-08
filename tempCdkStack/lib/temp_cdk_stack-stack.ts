import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs'; 
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
export class TempCdkStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // timeOfDay lambda construct
    const lambdaFunc = new lambdaNodeJs.NodejsFunction(this, "timeOfDay", {
      entry: "./lambda/timeOfDay.js",
      handler: "index",
      runtime: lambda.Runtime.NODEJS_20_X, 
    });

    // create Rest Api
    const restApi = new apigateway.RestApi(this, "timeOfDayRestAPI");
    restApi.root.addMethod("GET", new apigateway.LambdaIntegration(lambdaFunc));
  }
}
