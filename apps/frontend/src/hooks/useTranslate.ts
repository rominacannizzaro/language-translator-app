"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { translateApi } from "@/lib";
import {
  TranslatePrimaryKey,
  TranslateRequest,
} from "@translator/shared-types";
import { useUser } from "./useUser";
import { useApp } from "@/components";

export const useTranslate = () => {
  const { user } = useUser();
  const { setError } = useApp();

  const queryClient = useQueryClient();
  const queryKey = ["translate", user ? user.userId : ""];

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
    onSuccess: (result) => {
      // If there is existing translation data, append the result (the new translation made) to the existing data that is cached
      if (translateQuery.data) {
        queryClient.setQueryData(
          queryKey,
          translateQuery.data.concat([result])
        );
      }
    },
    onError: (e) => {
      setError(e.toString());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: TranslatePrimaryKey) => {
      if (!user) {
        throw new Error("User is not logged in");
      }

      return translateApi.deleteUserTranslation(key);
    },
    onSuccess: (result) => {
      if (!translateQuery.data) {
        return;
      }

      // Find the index of the item being deleted
      const index = translateQuery.data.findIndex(
        (translationItem) => translationItem.requestId === result.requestId
      );

      // Remove the deleted item from the cached data
      const copyData = [...translateQuery.data];
      copyData.splice(index, 1);

      queryClient.setQueryData(queryKey, copyData); // update the cached data with the modified list
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
