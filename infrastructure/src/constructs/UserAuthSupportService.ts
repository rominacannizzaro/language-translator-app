import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";

export interface UserAuthSupportService extends cdk.StackProps {}

export class UserAuthSupportService extends Construct {
  userPool: cognito.UserPool;

  constructor(scope: Construct, id: string, props?: UserAuthSupportService) {
    super(scope, id);

    // Cognito UserPool construct
    this.userPool = new cognito.UserPool(this, "translatorUserPool", {
      selfSignUpEnabled: true, // Allows users to register themselves (self-registration). If set to 'false', only admin can create users.
      signInAliases: { email: true }, // Controls sign-in method. User is allowed to sign in using their email address (not phone number, etc.).
      autoVerify: { email: true }, // Cognito will automatically send a verification email to confirm user's email address after sign up.
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Cognito UserPool Client construct
    // UserPool Client creates an integration between the app and UserPool. Enables apps to interact w/the UserPool (initiate sign-in/registration, authenticate users)
    const userPoolClient = new cognito.UserPoolClient(
      this,
      "translatorUserPoolClient",
      {
        userPool: this.userPool, // Attach userPool to UserPoolClient
        userPoolClientName: "translator-web-client",
        generateSecret: false, // No client secret (suitable for public clients like SPAs)
        supportedIdentityProviders: [
          cognito.UserPoolClientIdentityProvider.COGNITO, // Only allow Cognito as identity provider (no federated IdPs)
        ],
      }
    );

    // Output userPool ID
    new cdk.CfnOutput(this, "userPoolId", {
      value: this.userPool.userPoolId,
    });

    // Output userPoolClient ID
    new cdk.CfnOutput(this, "userPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
  }
}
