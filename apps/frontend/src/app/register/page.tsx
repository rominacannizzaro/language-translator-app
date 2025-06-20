"use client";

import { useState } from "react";
import { signUp, confirmSignUp } from "aws-amplify/auth";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
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
        } catch (e) {}
      }}
    >
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          className="bg-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          className="bg-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">Retype password:</label>
        <input
          id="password2"
          type="password"
          className="bg-white"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
      </div>

      <button className="btn bg-blue-500" type="submit">
        Register
      </button>

      <Link className="hover:underline" href="/user">
        Log in
      </Link>
    </form>
  );
}
