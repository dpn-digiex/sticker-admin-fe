import React, { createContext, useState, ReactNode, useEffect } from "react";

import { getStoredAuth } from "@apis/authStorage";
import { ROLES_NAME } from "@constants/index";
import { AuthData } from "types/index";

export interface AuthContextType {
  auth: AuthData;
  setAuth: React.Dispatch<React.SetStateAction<AuthData>>;
  isCheckingAuth: boolean;
  setIsCheckingAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/** Map backend role (owner | customer) to frontend roles for RoleBasedRoute. */
function toAuthData(stored: {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string; role: "owner" | "customer" };
}): AuthData {
  const roles = stored.user.role === "owner" ? [ROLES_NAME.ADMIN] : ["user"];
  return {
    roles,
    accessToken: stored.accessToken,
    refreshToken: stored.refreshToken,
    user: {
      id: stored.user.id,
      name: stored.user.name,
      email: stored.user.email,
    },
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [auth, setAuth] = useState<AuthData>({} as AuthData);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      setAuth(toAuthData(stored));
    }
    setIsCheckingAuth(false);
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      setAuth({} as AuthData);
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, setAuth, isCheckingAuth, setIsCheckingAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
