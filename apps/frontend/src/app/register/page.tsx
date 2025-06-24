"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignInStateType, SignUpStateType } from "@/lib";
import { ConfirmSignUp, RegistrationForm } from "@/components";
import { useUser } from "@/hooks";

/**
 * Attempts to automatically sign in the user.
 * This component is rendered when the sign-up flow reaches the 'COMPLETE_AUTO_SIGN_IN' step,
 * which typically occurs after email confirmation (if required) when `autoSignIn: true` was used during sign-up.
 * It uses a `useEffect` hook to trigger the auto-sign-in process immediately upon mounting.
 */
function AutoSignIn({
  onStepChange,
}: {
  onStepChange: (step: SignInStateType) => void;
}) {
  const { autoLogin } = useUser();

  useEffect(() => {
    autoLogin().then((nextStep) => {
      if (nextStep) {
        console.log("nextStep from AutoSignIn:", nextStep);
        onStepChange(nextStep);
      }
    });
  }, []);
  return <div>Signing in...</div>;
}

/**
 * Renders different components based on the registration flow state:
 * 1. Show registration form initially
 * 2. After registration, show confirmation form to enter verification code
 * 3. After successful confirmation, auto sign-in and redirect authenticated user
 */
export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<SignInStateType | SignUpStateType | null>(
    null
  );

  // Once a sign-in step is detected as "DONE", redirect the user to the homepage
  useEffect(() => {
    if (!step) return;

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
  }

  return <RegistrationForm onStepChange={setStep} />;
}
