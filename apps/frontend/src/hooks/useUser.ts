"use client";

import { useApp } from "@/components";
import {
  LoginFormData,
  RegisterConfirmation,
  RegisterFormData,
  SignInStateType,
  SignUpStateType,
} from "@/lib";
import {
  signIn,
  getCurrentUser,
  signOut,
  signUp,
  confirmSignUp,
  autoSignIn,
} from "aws-amplify/auth";
import { useCallback, useEffect, useState } from "react";

/**
 * Hook to detect and provide current user state across the app.
 * Centralizes authentication-related logic (sign-in, sign-out, register, confirm registration, auto sign-in)
 * and updates user state in the app context.
 */
export const useUser = () => {
  const [busy, setBusy] = useState<boolean>(false);
  const { user, setUser, setError, resetError } = useApp();

  // On component mount, fetch the current authenticated user and update app context
  useEffect(() => {
    async function fetchUser() {
      setBusy(true);
      await getUser();
      setBusy(false);
    }

    fetchUser();
  }, []);

  /**
   * Fetches the current authenticated user and updates user state.
   * Sets user to null if not authenticated.
   */ const getUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  /**
   * Logs in the user using AWS Amplify Auth signIn.
   * Updates busy state, handles errors, and updates user state in app context.
   */
  const login = useCallback(async ({ email, password }: LoginFormData) => {
    try {
      setBusy(true);
      resetError();
      await signIn({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      await getUser(); // after signing in, set user
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const logout = useCallback(async ({ email, password }: LoginFormData) => {
    try {
      setBusy(true);
      resetError();
      await signOut();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    } finally {
      setBusy(false);
    }
  }, []);

  /**
   * Logs in the user using AWS Amplify Auth signIn.
   * Updates busy state, handles errors, and updates user state in app context.
   */
  const register = async ({
    email,
    password,
    password2,
  }: RegisterFormData): Promise<SignUpStateType | null> => {
    let rtnValue = null;
    try {
      setBusy(true);
      resetError();
      if (password !== password2) {
        throw new Error("Passwords do not match");
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
      rtnValue = nextStep as SignUpStateType;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    } finally {
      setBusy(false);
      return rtnValue;
    }
  };

  /**
   * Confirms user registration with AWS Amplify Auth confirmSignUp.
   * Handles errors and returns next step in registration flow.
   */
  const confirmRegister = async ({
    email,
    verificationCode,
  }: RegisterConfirmation): Promise<SignUpStateType | null> => {
    let rtnValue = null;
    try {
      setBusy(true);
      resetError();
      const { nextStep } = await confirmSignUp({
        confirmationCode: verificationCode,
        username: email,
      });
      rtnValue = nextStep as SignUpStateType;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    } finally {
      setBusy(false);
      return rtnValue;
    }
  };

  /**
   * Attempts auto-login via AWS Amplify Auth autoSignIn.
   * Updates user state in app context and returns next step in sign-in flow.
   */
  const autoLogin = useCallback(async (): Promise<SignInStateType | null> => {
    let rtnValue = null;
    try {
      setBusy(true);
      resetError();
      const { nextStep } = await autoSignIn();
      rtnValue = nextStep as SignInStateType;
      await getUser(); // after auto login, update user state
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    } finally {
      setBusy(false);
      return rtnValue;
    }
  }, []);

  return {
    user,
    busy,
    login,
    logout,
    register,
    confirmRegister,
    autoLogin,
  };
};
