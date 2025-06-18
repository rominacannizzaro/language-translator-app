import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import {
  RestApiService,
  TranslationService,
  StaticWebsiteDeployment,
} from "../constructs";

export class TranslatorServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Project paths
    const monorepoRoot = path.join(__dirname, "../..", "../");

    const lambdaLayersDirPath = path.join(
      monorepoRoot,
      "packages",
      "lambda-layers"
    );

    const domain = "yourDomain.com"; // add your own domain (e.g.: mydomain.com)
    const fullUrl = `www.${domain}`;
    const apiUrl = `api.${domain}`; // custom url for the API Gateway

    // Fetch Route53 hosted zone by domain name
    const zone = route53.HostedZone.fromLookup(this, "zone", {
      domainName: domain,
    });

    // Create an ACM certificate for the domain and www subdomain with DNS validation in Route 53
    const certificate = new acm.Certificate(this, "certificate", {
      domainName: domain,
      subjectAlternativeNames: [fullUrl, apiUrl],
      validation: acm.CertificateValidation.fromDns(zone), // Automatically creates the DNS records in Route 53 hosted zone (DNS validation)
    });

    const restApi = new RestApiService(this, "restApiService", {
      apiUrl,
      certificate,
      zone,
    });

    new TranslationService(this, "translationService", {
      monorepoRoot,
      lambdaLayersDirPath,
      restApi,
    });

    new StaticWebsiteDeployment(this, "staticWebsiteDeployment", {
      domain,
      fullUrl,
      certificate,
      zone,
    });
  }
}
