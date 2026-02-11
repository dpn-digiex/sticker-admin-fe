import React, { createContext, useState, ReactNode, useEffect } from "react";

import { ROLES_NAME } from "@constants/index";
import { AuthData } from "types/index";

export interface AuthContextType {
  auth: AuthData;
  setAuth: React.Dispatch<React.SetStateAction<AuthData>>;
  isCheckingAuth: boolean;
  setIsCheckingAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

const MOCK_AUTH_DATA: AuthData = {
  roles: [ROLES_NAME.ADMIN],
  user: {
    id: "1",
    name: "Admin",
    email: "admin@gmail.com",
  },
  accessToken: "1234567890",
  refreshToken: "1234567890",
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [auth, setAuth] = useState<AuthData>({} as AuthData);

  useEffect(() => {
    setAuth(MOCK_AUTH_DATA);
    setIsCheckingAuth(false);
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
