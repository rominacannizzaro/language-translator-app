import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { LoginFormData } from "@/lib";
import { useUser } from "@/hooks/useUser";

// Login form component
export const LoginForm = ({ onSignedIn }: { onSignedIn?: () => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const { login } = useUser();

  const onSubmit: SubmitHandler<LoginFormData> = async (data, event) => {
    event && event.preventDefault();
    login(data).then(() => {
      onSignedIn && onSignedIn();
    });
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
