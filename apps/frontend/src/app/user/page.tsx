"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, signIn, signOut } from "aws-amplify/auth";

// Log in component
function Login({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
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

      <button className="btn bg-blue-500" type="submit">
        Log in
      </button>

      <Link className="hover:underline" href="/register">
        Register
      </Link>
    </form>
  );
}

// Log out component
function Logout({ onSignedOut }: { onSignedOut: () => void }) {
  return (
    <div>
      <button
        className="btn bg-blue-500 w-full"
        onClick={async () => {
          await signOut();
          //Once signout is done, call onSignedOut()
          onSignedOut();
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default function User() {
  const [user, setUser] = useState<object | null | undefined>(undefined);

  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (e) {
        console.error(e);
        setUser(null);
      }
    }

    fetchUser();
  }, []);

  if (user === undefined) {
    return <p>Loading...</p>;
  }

  if (user) {
    return (
      <Logout
        onSignedOut={() => {
          setUser(null); // Once logging out is done, set user to 'null', and Login option will be shown to the user
        }}
      />
    );
  }

  return (
    <Login
      onSignedIn={async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser); // Once logging in is done, we get the current user, we set the user and, once user is set, Log out option will be shown to the user
      }}
    />
  );
}
