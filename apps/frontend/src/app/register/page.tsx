"use client";

import { useEffect, useState } from "react";
import { confirmSignUp, autoSignIn } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { SignInStateType, SignUpStateType } from "@/lib";
import { RegistrationForm } from "@/components";

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
