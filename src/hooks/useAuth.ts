import { useContext, useDebugValue } from "react";

import { AuthContextType , AuthContext } from "@contexts/AuthProvider";



const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  const { auth } = context;

  useDebugValue(auth, auth => (auth?.user ? "Logged In" : "Logged Out"));

  return context;
};

export default useAuth;
