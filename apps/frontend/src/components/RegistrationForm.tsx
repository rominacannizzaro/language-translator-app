import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslate } from "@/hooks";
import { TranslateRequest } from "@translator/shared-types";
import { RegisterFormData, SignUpStateType } from "@/lib";
import { signUp } from "aws-amplify/auth";

/**
 * Renders the initial user registration form.
 * Handles user input for email and passwords, performs basic client-side validation,
 * and initiates the user signup process with AWS Amplify.
 */

export const RegistrationForm = ({
  onStepChange,
}: {
  onStepChange: (step: SignUpStateType) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const onSubmit: SubmitHandler<RegisterFormData> = async (
    { email, password, password2 },
    event
  ) => {
    event && event.preventDefault();

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
      console.error(e);
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
        <label htmlFor="password">Password: </label>
        <input
          id="password"
          type="password"
          className="bg-white"
          {...register("password", { required: true })}
        />
        {errors.password && <span>Field is required</span>}
      </div>

      <div className="my-1">
        <label htmlFor="password2">Retype password: </label>
        <input
          id="password2"
          type="password"
          className="bg-white"
          {...register("password2", { required: true })}
        />
        {errors.password2 && <span>Field is required</span>}
      </div>

      <button className="btn bg-blue-500 p-2 mt-2 rounded-xl" type="submit">
        {"Register"}
      </button>
    </form>
  );
};
