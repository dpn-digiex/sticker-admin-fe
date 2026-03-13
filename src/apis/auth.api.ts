import { axiosPublic } from "@apis/clientAxios";
import { API_ENDPOINTS } from "@constants/index";

/** Backend auth token response (login, register, refresh). */
export type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    role: "owner" | "customer";
  };
};

/** Backend service response wrapper. */
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type RegisterBody = {
  email: string;
  password: string;
  name: string;
};

/** Login with email and password. Returns tokens and user. */
export async function login(body: LoginBody): Promise<AuthTokenResponse> {
  const res = await axiosPublic.post<ApiResponse<AuthTokenResponse>>(
    API_ENDPOINTS.LOGIN,
    body
  );
  const data = (res.data?.data ?? res.data) as AuthTokenResponse;
  if (!data?.accessToken || !data?.user) {
    throw new Error(res.data?.message ?? "Login failed");
  }
  return data as AuthTokenResponse;
}

/** Refresh access token using refresh token. */
export async function refreshToken(
  refreshTokenValue: string
): Promise<AuthTokenResponse> {
  const res = await axiosPublic.post<ApiResponse<AuthTokenResponse>>(
    API_ENDPOINTS.REFRESH,
    { refreshToken: refreshTokenValue }
  );
  const data = (res.data?.data ?? res.data) as AuthTokenResponse;
  if (!data?.accessToken || !data?.user) {
    throw new Error(res.data?.message ?? "Refresh failed");
  }
  return data as AuthTokenResponse;
}

/** Current user (requires Authorization header; use with axiosPrivate after attaching token). */
export type MeResponse = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export async function getMe(accessToken: string): Promise<MeResponse | null> {
  const res = await axiosPublic.get<ApiResponse<MeResponse>>(API_ENDPOINTS.ME, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = res.data?.data ?? res.data;
  return (data as MeResponse) ?? null;
}
