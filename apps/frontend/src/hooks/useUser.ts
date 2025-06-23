"use client";

import { useApp } from "@/components";
import { LoginFormData } from "@/lib";
import { signIn, getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";

// Hook to detect and provide the current user state across the app.
// Centralizes user detection logic (via Amplify getCurrentUser) and updates the user state in the app context.
export const useUser = () => {
  const [busy, setBusy] = useState<boolean>(false);
  const { user, setUser } = useApp();

  // Detect if a user is logged in
  useEffect(() => {
    async function fetchUser() {
      try {
        setBusy(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setBusy(false);
      }
    }

    fetchUser();
  }, []);

  // Logs in the user using Amplify Auth signIn, and updates 'busy' state during the process.
  // Centralizes login logic so it can be reused across the app (e.g. by LoginForm).
  const login = async ({ email, password }: LoginFormData) => {
    try {
      setBusy(true);
      await signIn({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return {
    user,
    busy,
    login,
  };
};
