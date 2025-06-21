import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cognito from "aws-cdk-lib/aws-cognito";

export interface RestApiServiceProps extends cdk.StackProps {
  apiUrl: string;
  certificate: acm.Certificate;
  zone: route53.IHostedZone;
  userPool?: cognito.UserPool;
}

export class RestApiService extends Construct {
  public restApi: apigateway.RestApi;
  public authorizer?: apigateway.CognitoUserPoolsAuthorizer;

  constructor(
    scope: Construct,
    id: string,
    { apiUrl, certificate, zone, userPool }: RestApiServiceProps
  ) {
    super(scope, id);

    // Create top level Rest Api
    this.restApi = new apigateway.RestApi(this, "timeOfDayRestAPI", {
      // Associate apiUrl domain name and the certificate with this Rest api
      domainName: {
        domainName: apiUrl,
        certificate,
      },
      // Add CORS to enable frontend app running on localhost during development to successfully communicate with the backend
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowCredentials: true,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    // If a Cognito user pool is provided, create a Cognito authorizer for the API Gateway
    // to check if incoming requests are from valid logged-in user
    if (userPool) {
      this.authorizer = new apigateway.CognitoUserPoolsAuthorizer(
        this.restApi,
        "authorizer",
        {
          cognitoUserPools: [userPool],
          authorizerName: "userPoolAuthorizer",
        }
      );
    }

    // Create Route 53 A record for the the rest api
    new route53.ARecord(this, "apiDns", {
      zone,
      recordName: "api",
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(this.restApi)
      ),
    });
  }

  addTranslateMethod({
    httpMethod,
    lambda,
    isAuth,
  }: {
    httpMethod: string;
    lambda: lambda.IFunction;
    isAuth?: boolean;
  }) {
    let options: apigateway.MethodOptions = {};
    if (isAuth) {
      if (!this.authorizer) {
        throw new Error("Authorizer is not set");
      }

      options = {
        authorizer: this.authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      };
    }
    this.restApi.root.addMethod(
      httpMethod,
      new apigateway.LambdaIntegration(lambda),
      options
    );
  }
}
