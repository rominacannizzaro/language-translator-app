import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { LoginFormData } from "@/lib";
import { signIn } from "aws-amplify/auth";

// Login form component
export const LoginForm = ({ onSignedIn }: { onSignedIn: () => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit: SubmitHandler<LoginFormData> = async (
    { email, password },
    event
  ) => {
    event && event.preventDefault();

    try {
      await signIn({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      //Once signin is done, call onSignedIn()
      onSignedIn();
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

      <button className="btn bg-blue-500 p-2 mt-2 rounded-xl" type="submit">
        {"Login"}
      </button>
    </form>
  );
};
