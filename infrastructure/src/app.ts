#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { TempCdkStackStack } from "./temp_cdk_stack-stack";

const app = new cdk.App();
new TempCdkStackStack(app, "TempCdkStackStack", {
  // Account and Region to deploy the stack to.
  env: {
    account: "yourAccountId",
    region: "us-east-1", // Important: ACM certificates used w/CloudFront distributions must be created in the us-east-1 (N. Virginia) region
  },
});
