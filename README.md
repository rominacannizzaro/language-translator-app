This is an application developed using Next.js, TypeScript, TailwindCSS and AWS Cloud Platform (using AWS services such as Lambda, API Gateway, DynamoDB, Cognito, Amplify).

Demo: https://www.language-translator-rcsoftdev.com/

## Description

This is a language translation app that allows users to translate text between languages and optionally keep track of past translations.

Users can input text, select the source and target languages, and receive a translation. Registered users can sign up with an email and password, confirm their registration via a verification code sent by email, and are then automatically logged in.

Once signed in, users can view, open, and delete their previous translations or create new ones. Finally, they can sign out.

## Tech stack

The backend is built using AWS as the cloud platform, utilizing AWS CDK for the infrastructure as code (IaC) and AWS SDK to interact with the AWS services. Some of the services used are AWS Lambda, API Gateway, DynamoDB, Cognito, Amplify.

The frontend is developed using Next.js, TypeScript, and TailwindCSS.

This project uses a monorepo setup with npm workspaces in order to organize both frontend and backend code within a single cohesive codebase.

## Installation and usage

In order to install and use this app locally, you will need to have NodeJS and npm installed on your computer. You will also need to have an AWS account and configure AWS on your CLI.

- Add the values needed in the `.env.local` file, in `ConfigureAmplifyClientSide.tsx` and in `translateApi.ts`.

- Boostrap your region (cdk bootstrap aws://yourAccountIdNum/us-east-1 - eg : cdk bootstrap aws://12345612366/us-east-1). Note: in this demo project, the AWS Region used is us-east-1 since ACM certificates for CloudFront must be in the us-east-1 region (to use an ACM certificate with Amazon CloudFront, as it is done in this project, this certificate must be requested in the us-east-1 (N. Virginia) Region).

- To build the Lambda layers, run `npm run lambda-layer:build-utils`

- To build the frontend, run `npm run frontend:build`

- To CDK Deploy, run `npm run cdk:deploy`. Run it one first time, on your CLI you will be provided with the values needed in the ConfigureAmplifyClientSide.tsx file. Add them. Build the frontend (`npm run frontend:build`) and deploy again (`npm run cdk:deploy`). You can also update the REST API URL in the http tester file if you wish to use the REST Client from your editor (`restAPI-example.http`)

- To start the app on localhost, run `npm run frontend:dev`.
