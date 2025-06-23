"use client";

import { useEffect, useState } from "react";
import { autoSignIn } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { SignInStateType, SignUpStateType } from "@/lib";
import { ConfirmSignUp, RegistrationForm } from "@/components";

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
