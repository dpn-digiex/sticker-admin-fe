import { refreshToken as refreshTokenApi } from "@apis/auth.api";
import { getRefreshToken, setStoredAuth } from "@apis/authStorage";
import { ROLES_NAME } from "@constants";
import { AuthData } from "types";

import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async (): Promise<string> => {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      throw new Error("No refresh token");
    }
    const data = await refreshTokenApi(refreshTokenValue);
    setStoredAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
    setAuth((prev: AuthData) => ({
      ...prev,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      roles: data.user.role === "owner" ? [ROLES_NAME.ADMIN] : ["user"],
      user: { id: data.user.id, name: data.user.name, email: data.user.email },
    }));
    return data.accessToken;
  };

  return refresh;
};

export default useRefreshToken;
