"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import { LoginForm } from "@/components";

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
      } catch {
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
    <LoginForm
      onSignedIn={async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser); // Once logging in is done, we get the current user, we set the user and, once user is set, Log out option will be shown to the user
      }}
    />
  );
}
