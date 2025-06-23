import { SignUpOutput, SignInOutput, AuthUser } from "aws-amplify/auth";

// Types representing the structure of the 'nextStep' object returned by AWS Amplify signUp and signIn methods
export type SignUpStateType = SignUpOutput["nextStep"];
export type SignInStateType = SignInOutput["nextStep"];

// AuthUser type from aws-amplify to represent the authenticated user in the app
export type AuthUserType = AuthUser;

export type RegisterFormData = {
  email: string;
  password: string;
  password2: string;
};

// Type for register confirmation data
export type RegisterConfirmation = {
  email: string;
  verificationCode: string;
};

// Type for Login form data
export type LoginFormData = {
  email: string;
  password: string;
};
