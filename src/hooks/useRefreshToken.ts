import { axiosPublic } from "@apis/clientAxios";
import { AuthData } from "types";

import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async (): Promise<string> => {
    try {
      const response = await axiosPublic.get<{ accessToken: string }>(
        "/refresh",
        {
          withCredentials: true,
        }
      );

      setAuth((prev: AuthData) => {
        console.log(JSON.stringify(prev));
        console.log("refresh token:", response.data.accessToken);
        return { ...prev, accessToken: response.data.accessToken };
      });

      return response.data.accessToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  };

  return refresh;
};

export default useRefreshToken;
