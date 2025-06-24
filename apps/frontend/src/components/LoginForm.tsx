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

  const { login, busy } = useUser();

  const onSubmit: SubmitHandler<LoginFormData> = async (data, event) => {
    event && event.preventDefault();
    login(data).then(() => {
      onSignedIn && onSignedIn();
    });
  };

  return (
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="my-1">
        <Label htmlFor="email" className="my-1">
          Email:
        </Label>
        <Input
          id="email"
          disabled={busy}
          className="bg-white"
          {...register("email", { required: true })}
        />
        {errors.email && <span>Field is required</span>}
      </div>

      <div className="my-1">
        <Label htmlFor="password" className="my-1">
          Password:
        </Label>
        <Input
          id="password"
          disabled={busy}
          type="password"
          className="bg-white"
          {...register("password", { required: true })}
        />
        {errors.password && <span>Field is required</span>}
      </div>

      <Button type="submit" className="my-2">
        {busy ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};
