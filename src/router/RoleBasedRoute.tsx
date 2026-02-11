import { ReactNode } from "react";

import { useLocation, Navigate } from "react-router-dom";

import { ROUTES_APP } from "@constants/index";

import useAuth from "../hooks/useAuth";

interface RoleBasedProps {
  allowedRoles: string[]; // Adjust to your role structure (e.g., number[] if roles are numbers)
  children: ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedProps> = ({
  allowedRoles,
  children,
}) => {
  const { auth, isCheckingAuth } = useAuth();
  const location = useLocation();

  const allowAccessRoute = auth?.roles?.some((role: string) =>
    allowedRoles.includes(role)
  );

  console.log("auth", auth);

  if (isCheckingAuth) {
    return <></>;
  } else if (allowAccessRoute) {
    return children;
  } else {
    return (
      <Navigate
        to={ROUTES_APP.UNAUTHORIZED}
        state={{ from: location }}
        replace
      />
    );
  }
};

export default RoleBasedRoute;
