const AUTH_STORAGE_KEY = "admin_auth";

export type StoredAuth = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "owner" | "customer";
  };
};

export function getStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.accessToken || !parsed?.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth | null): void {
  if (auth == null) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function getAccessToken(): string | null {
  return getStoredAuth()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getStoredAuth()?.refreshToken ?? null;
}

/** Clear stored auth and notify app (e.g. redirect to login). */
export function logout(): void {
  setStoredAuth(null);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }
}
