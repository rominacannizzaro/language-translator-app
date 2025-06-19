// Amplify.configure() must run on the client (in the browser), not on the server.
// By default, Next.js 'layout.tsx' is a server Component (runs on the server).
// Therefore, this separate client component is created to run Amplify.configure() on the browser side.
"use client";
import { Amplify } from "aws-amplify";

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_qb2KpKvnC",
        userPoolClientId: "jnt9fva0q3es8fclu1qaqsr6n",
      },
    },
  },
  { ssr: true }
);

export function ConfigureAmplify() {
  return null;
}
