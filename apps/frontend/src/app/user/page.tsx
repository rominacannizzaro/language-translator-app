"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "aws-amplify/auth";

export default function User() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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

      <button className="btn bg-blue-500" type="submit">
        Log in
      </button>

      <Link className="hover:underline" href="/register">
        Register
      </Link>
    </form>
  );
}
