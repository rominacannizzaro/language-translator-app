import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  RestApiService,
  TranslationService,
  StaticWebsiteDeployment,
  CertificateWrapper,
  UserAuthSupportService,
} from "../constructs";
import { getConfig } from "../helpers";

const config = getConfig();

export class TranslatorServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domain = config.domain; // add your own domain (e.g.: mydomain.com)
    const webUrl = `${config.webSubdomain}.${domain}`;
    const apiUrl = `${config.apiSubdomain}.${domain}`; // custom url for the API Gateway

    const certWrapper = new CertificateWrapper(this, "certificateWrapper", {
      domain,
      apiUrl,
      webUrl,
    });

    // User Auth support
    const userAuth = new UserAuthSupportService(this, "userAuthSupport");

    const restApi = new RestApiService(this, "restApiService", {
      apiUrl,
      certificate: certWrapper.certificate,
      zone: certWrapper.zone,
    });

    new TranslationService(this, "translationService", {
      restApi,
    });

    new StaticWebsiteDeployment(this, "staticWebsiteDeployment", {
      domain,
      webUrl,
      certificate: certWrapper.certificate,
      zone: certWrapper.zone,
    });
  }
}
