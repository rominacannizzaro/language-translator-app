import { AuthUserType } from "@/lib";
import React, { useContext, createContext, useState } from "react";

type AppContextType = {
  user: AuthUserType | null | undefined; // 3 possible states for user - 'Undefined': on loading, user status is still unknown/checking. 'Null': not logged in. 'AuthUser': logged in.
  setUser: (user: AuthUserType) => void;
};

const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
});

function useInitalApp(): AppContextType {
  const [user, setUser] = useState<AuthUserType | null | undefined>(undefined);

  return {
    user,
    setUser,
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
