#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { TranslatorServiceStack } from "./stacks";

const app = new cdk.App();
new TranslatorServiceStack(app, "TranslatorService", {
  // Account and Region to deploy the stack to.
  env: {
    account: "yourAccountId",
    region: "us-east-1", // Important: ACM certificates used w/CloudFront distributions must be created in the us-east-1 (N. Virginia) region
  },
});
