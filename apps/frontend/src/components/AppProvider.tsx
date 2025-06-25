"use client";

import { AuthUserType } from "@/lib";
import { TranslateResult } from "@translator/shared-types";
import React, { useContext, createContext, useState } from "react";
import { toast } from "sonner";

type AppContextType = {
  user: AuthUserType | null | undefined; // 3 possible states for user - 'Undefined': on loading, user status is still unknown/checking. 'Null': not logged in. 'AuthUser': logged in.
  setUser: (user: AuthUserType | null) => void;
  setError: (msg: string) => void;
  resetError: () => void;
  selectedTranslation: TranslateResult | null;
  setSelectedTranslation: (item: TranslateResult) => void;
};

const AppContext = createContext<AppContextType>({
  user: null,
  setUser: (user) => {},
  setError: (msg) => {},
  resetError: () => {},
  selectedTranslation: null,
  setSelectedTranslation: (item: TranslateResult) => {},
});

function useInitalApp(): AppContextType {
  const [selectedTranslation, setSelectedTranslation] =
    useState<TranslateResult | null>(null);
  const [user, setUser] = useState<AuthUserType | null | undefined>(undefined);

  return {
    user,
    setUser,
    setError: (msg) => {
      toast("Error", {
        description: msg,
        style: {
          backgroundColor: "#ef4444",
          color: "white",
        },
      });
    },
    resetError: () => {
      toast.dismiss();
    },
    selectedTranslation,
    setSelectedTranslation,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const initialValue = useInitalApp();
  return (
    <AppContext.Provider value={initialValue}>{children}</AppContext.Provider>
  );
}

// Hook to access the user's data throughout the app
// Allows maintaining the logged-in user's state available globally
export function useApp() {
  return useContext(AppContext);
}
