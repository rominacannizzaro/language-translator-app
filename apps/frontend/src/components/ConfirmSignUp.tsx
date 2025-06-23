import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { RegisterConfirmation, SignUpStateType } from "@/lib";
import { confirmSignUp } from "aws-amplify/auth";

/**
 * Renders the confirmation form for user email verification.
 * This component prompts the user to enter the verification code received via email
 * to confirm their newly created account in Cognito.
 * It uses `aws-amplify/auth.confirmSignUp` to complete the verification process.
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

  const onSubmit: SubmitHandler<RegisterConfirmation> = async (
    { email, verificationCode },
    event
  ) => {
    event && event.preventDefault();

    try {
      console.log("on confirm called");
      const { nextStep } = await confirmSignUp({
        confirmationCode: verificationCode,
        username: email,
      });

      console.log("signUpStep:", nextStep.signUpStep);
      onStepChange(nextStep);
    } catch (e) {
      console.error("Confirmation error:", e);
    }
  };

  return (
    <form className="flex flex-col space y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          className="bg-white"
          {...register("email", { required: true })}
        />
        {errors.email && <span>Field is required</span>}
      </div>

      <div className="my-1">
        <label htmlFor="verificationCode">Verification code: </label>
        <input
          id="verificationCode"
          type="string"
          className="bg-white"
          {...register("verificationCode", { required: true })}
        />
        {errors.verificationCode && <span>Field is required</span>}
      </div>

      <button className="btn bg-blue-500 p-2 mt-2 rounded-xl" type="submit">
        {"Confirm"}
      </button>
    </form>
  );
};
