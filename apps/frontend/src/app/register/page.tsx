"use client";

import { useEffect, useState } from "react";
import {
  signUp,
  confirmSignUp,
  autoSignIn,
  SignUpOutput,
  SignInOutput,
} from "aws-amplify/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types representing the structure of the 'nextStep' object returned by AWS Amplify signUp and signIn methods
type SignUpStateType = SignUpOutput["nextStep"];
type SignInStateType = SignInOutput["nextStep"];

/**
 * Renders the initial user registration form.
 * Handles user input for email and passwords, performs basic client-side validation,
 * and initiates the user signup process with AWS Amplify.
 */
function RegistrationForm({
  onStepChange,
}: {
  onStepChange: (step: SignUpStateType) => void;
}) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          if (password !== password2) {
            throw new Error("Passwords don't match");
          }

          // Initiate the user sign-up process with AWS Amplify
          const { nextStep } = await signUp({
            username: email,
            password: password,
            options: {
              userAttributes: {
                email, // Pass email as a user attribute for Cognito
              },
              autoSignIn: true, // After successful sign-up, automatically attempt to sign the user in
            },
          });
          /**
           * When the signUp fc is called, it returns a 'nextStep' object, whose 'signUpStep' property indicates the current state of the sign-up flow.
           * SignUpStep can be: "DONE" | "CONFIRM_SIGN_UP" | "COMPLETE_AUTO_SIGN_IN"
           * When the user submits email and password twice on the /register page, it will return "CONFIRM_SIGN_UP":
           * a confirmation email with a verification code has been sent to the user
           * and user has been added to the Cognito User Pool with email_verified = false and confirmation status = "unconfirmed"
           */
          console.log("signUpStep:", nextStep.signUpStep);
          onStepChange(nextStep);
        } catch (e) {
          console.error("Registration error:", e);
        }
      }}
    >
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          className="bg-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          className="bg-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password2">Retype password:</label>
        <input
          id="password2"
          type="password"
          className="bg-white"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
      </div>

      <button className="btn bg-blue-500" type="submit">
        Register
      </button>

      <Link className="hover:underline" href="/user">
        Log in
      </Link>
    </form>
  );
}

/**
 * Renders the confirmation form for user email verification.
 * This component prompts the user to enter the verification code received via email
 * to confirm their newly created account in Cognito.
 * It uses `aws-amplify/auth.confirmSignUp` to complete the verification process.
 */
function ConfirmSignUp({
  onStepChange,
}: {
  onStepChange: (step: SignUpStateType) => void;
}) {
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          const { nextStep } = await confirmSignUp({
            confirmationCode: verificationCode,
            username: email,
          });

          console.log("signUpStep:", nextStep.signUpStep);
          onStepChange(nextStep);
        } catch (e) {
          console.error("Confirmation error:", e);
        }
      }}
    >
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          className="bg-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="verificationCode">Verification code:</label>
        <input
          id="verificationCode"
          type="text"
          className="bg-white"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />
      </div>

      <button className="btn bg-blue-500" type="submit">
        Confirm
      </button>
    </form>
  );
}

/**
 * Attempts to automatically sign in the user.
 * This component is rendered after a successful sign-up and email confirmation,
 * especially when the `autoSignIn: true` option was used during the initial `signUp` call.
 * It uses a `useEffect` hook to trigger the auto-sign-in process immediately upon mounting.
 */
function AutoSignIn({
  onStepChange,
}: {
  onStepChange: (step: SignInStateType) => void;
}) {
  useEffect(() => {
    const asyncSignIn = async () => {
      const { nextStep } = await autoSignIn();
      console.log("nextStep from AutoSignIn:", nextStep);
      onStepChange(nextStep);
    };

    asyncSignIn();
  }, []);
  return <div>Signing in...</div>;
}

/**
 * Render different components based on the registration flow state:
 * 1. Show registration form initially
 * 2. After registration, show confirmation form to enter verification code
 * 3. After successful confirmation, auto sign-in and redirect authenticated user
 */
export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<SignInStateType | SignUpStateType | null>(
    null
  );

  // useEffect that monitors the state of the step
  useEffect(() => {
    if (!step) return;

    // If sign in was done, route to home page
    if ((step as SignInStateType).signInStep === "DONE") {
      router.push("./");
    }
  }, [step]);

  if (step) {
    // After user submits the registration form, the returned signUpStep will be 'CONFIRM_SIGN_UP', indicating email confirmation is required.
    if ((step as SignUpStateType).signUpStep === "CONFIRM_SIGN_UP") {
      return <ConfirmSignUp onStepChange={setStep} />;
    }

    // After user submits the verification code received by email, the returned signUpStep will be 'COMPLETE_AUTO_SIGN_IN', triggering automatic sign-in.
    if ((step as SignUpStateType).signUpStep === "COMPLETE_AUTO_SIGN_IN") {
      return <AutoSignIn onStepChange={setStep} />;
    }

    // TO-DO: Once AutoSignIn is done, page re-routing will be implemented
  }

  return <RegistrationForm onStepChange={setStep} />;
}
