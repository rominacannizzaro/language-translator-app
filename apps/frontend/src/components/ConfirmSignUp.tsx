import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { RegisterConfirmation, SignUpStateType } from "@/lib";
import { useUser } from "@/hooks";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

/**
 * Renders the confirmation form for user email verification.
 * This component prompts the user to enter the verification code received via email
 * to confirm their newly created account in Cognito.
 *
 * It calls the confirmRegister function from useUser,
 * which internally uses aws-amplify/auth.confirmSignUp to complete the verification process.
 */
export const ConfirmSignUp = ({
  onStepChange,
}: {
  onStepChange: (step: SignUpStateType) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterConfirmation>();

  const { confirmRegister, busy } = useUser();

  const onSubmit: SubmitHandler<RegisterConfirmation> = async (data, event) => {
    if (event) {
      event.preventDefault();
    }

    confirmRegister(data).then((nextStep) => {
      if (nextStep) {
        console.log("signUpStep:", nextStep.signUpStep);
        onStepChange(nextStep); // move to the next step
      }
    });
  };

  return (
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5">
        <p>We have sent a verification code to your email.</p>
        <p>
          Please, enter your email address and the verification code below to
          continue:
        </p>
      </div>
      <div>
        <Label htmlFor="email">Email:</Label>
        <Input
          id="email"
          disabled={busy}
          className="bg-white"
          {...register("email", { required: true })}
        />
        {errors.email && <span>Field is required</span>}
      </div>

      <div className="my-1">
        <Label htmlFor="verificationCode">Verification code: </Label>
        <Input
          id="verificationCode"
          disabled={busy}
          type="string"
          className="bg-white"
          {...register("verificationCode", { required: true })}
        />
        {errors.verificationCode && <span>Field is required</span>}
      </div>

      <Button type="submit" className="my-5">
        Confirm
      </Button>
    </form>
  );
};
