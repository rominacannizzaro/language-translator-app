"use client";

import { AuthUserType } from "@/lib";
import React, { useContext, createContext, useState } from "react";
import { toast } from "sonner";

type AppContextType = {
  user: AuthUserType | null | undefined; // 3 possible states for user - 'Undefined': on loading, user status is still unknown/checking. 'Null': not logged in. 'AuthUser': logged in.
  setUser: (user: AuthUserType | null) => void;
  setError: (msg: string) => void;
  resetError: () => void;
};

const AppContext = createContext<AppContextType>({
  user: null,
  setUser: (user) => {},
  setError: (msg) => {},
  resetError: () => {},
});

function useInitalApp(): AppContextType {
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
