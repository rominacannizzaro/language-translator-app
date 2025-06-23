"use client";

import { useApp } from "@/components";
import { getCurrentUser } from "aws-amplify/auth";
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

  return {
    user,
    busy,
  };
};
