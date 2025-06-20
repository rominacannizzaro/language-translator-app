"use client";

import { useState } from "react";
import { signIn, signOut } from "aws-amplify/auth";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");

  return (
    <form className="flex flex-col space-y-4" onSubmit={async (event) => {}}>
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
          type="password2"
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
