import { SignUpOutput, SignInOutput } from "aws-amplify/auth";

// Types representing the structure of the 'nextStep' object returned by AWS Amplify signUp and signIn methods
export type SignUpStateType = SignUpOutput["nextStep"];
export type SignInStateType = SignInOutput["nextStep"];

export type RegisterFormData = {
  email: string;
  password: string;
  password2: string;
};
