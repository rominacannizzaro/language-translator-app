import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { LoginFormData } from "@/lib";
import { useUser } from "@/hooks/useUser";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
        <Label htmlFor="email">Email:</Label>
        <Input
          id="email"
          className="bg-white"
          {...register("email", { required: true })}
        />
        {errors.email && <span>Field is required</span>}
      </div>

      <div className="my-1">
        <Label htmlFor="password">Password: </Label>
        <Input
          id="password"
          type="password"
          className="bg-white"
          {...register("password", { required: true })}
        />
        {errors.password && <span>Field is required</span>}
      </div>

      <Button type="submit">{"Login"}</Button>
    </form>
  );
};
