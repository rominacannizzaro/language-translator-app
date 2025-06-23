"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { translateApi } from "@/lib";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import {
  TranslatePrimaryKey,
  TranslateRequest,
} from "@translator/shared-types";
import { emptyPromise } from "@/lib/helpers";

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

  const translateMutation = useMutation({
    mutationFn: (request: TranslateRequest) => {
      // This mutation fc sends the translation request to either the public or authenticated API endpoint, based on whether a user is logged in
      if (user) {
        return translateApi.translateUsersText(request);
      } else {
        return translateApi.translatePublicText(request);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: TranslatePrimaryKey) => {
      if (!user) {
        return emptyPromise;
      }

      return translateApi.deleteUserTranslation(key);
    },
  });

  return {
    translations: !translateQuery.data ? [] : translateQuery.data,
    isLoading: translateQuery.status === "pending",
    translate: translateMutation.mutate,
    isTranslating: translateMutation.status === "pending",
    deleteTranslation: deleteMutation.mutate,
    isDeleting: deleteMutation.status === "pending",
  };
};
