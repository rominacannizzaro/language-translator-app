import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useUser } from "@/hooks";
import { RegisterFormData, SignUpStateType } from "@/lib";

/**
 * Renders the initial user registration form.
 * Handles user input for email and passwords, performs basic client-side validation,
 * and calls the useUser hook to initiate the signup flow via AWS Amplify.
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

  const { register: accountRegister } = useUser();

  const onSubmit: SubmitHandler<RegisterFormData> = async (data, event) => {
    event && event.preventDefault();

    /**
     *  When the register() function from useUser is called, it returns a 'nextStep' object, whose 'signUpStep' property indicates the current state of the sign-up flow.
     * SignUpStep can be: "DONE" | "CONFIRM_SIGN_UP" | "COMPLETE_AUTO_SIGN_IN"
     * When the user submits email and password twice on the /register page, it will return "CONFIRM_SIGN_UP":
     * a confirmation email with a verification code has been sent to the user
     * and user has been added to the Cognito User Pool with email_verified = false and confirmation status = "unconfirmed"
     */
    accountRegister(data).then((nextStep) => {
      if (nextStep) {
        console.log("signUpStep:", nextStep.signUpStep);
        onStepChange(nextStep);
      }
    });
  };

  return (
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
