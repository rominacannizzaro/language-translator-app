"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { translateApi } from "@/lib";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";

export const useTranslate = () => {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const queryClient = useQueryClient();
  const queryKey = ["translate", user ? user.userId : ""];

  // Detect if there is user is logged in
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

  const translateQuery = useQuery({
    queryKey,
    queryFn: () => {
      console.log("translate query fc");
      // If there is no user logged in, return empty array. Else, return user's translations.
      if (!user) {
        return [];
      }
      return translateApi.getUsersTranslations();
    },
  });

  return {
    translations: !translateQuery.data ? [] : translateQuery.data,
    isLoading: translateQuery.status === "pending",
  };
};
