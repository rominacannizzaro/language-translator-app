#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { TranslatorServiceStack } from "./stacks";
import { getConfig } from "./helpers";

const config = getConfig();

const app = new cdk.App();
new TranslatorServiceStack(app, "TranslatorService", {
  // Account and Region to deploy the stack to.
  env: {
    account: config.awsAccountId,
    region: config.awsRegion, // Important: ACM certificates used w/CloudFront distributions must be created in the us-east-1 (N. Virginia) region
  },
});
