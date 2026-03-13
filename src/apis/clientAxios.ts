import axios, { type InternalAxiosRequestConfig } from "axios";

import { refreshToken } from "@apis/auth.api";
import {
  getAccessToken,
  getRefreshToken,
  setStoredAuth,
} from "@apis/authStorage";
import useToastStore from "@stores/toastStore";
import { getApiErrorMessage } from "@utils";

// Create axios instance with default config
const BASE_URL = import.meta.env.VITE_API_URL;

export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Attach Bearer token to every request
axiosPrivate.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// 401: try refresh, then retry; else show toast
axiosPrivate.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refresh = getRefreshToken();
      if (refresh) {
        if (isRefreshing) {
          return new Promise(resolve => {
            addRefreshSubscriber((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosPrivate(originalRequest));
            });
          });
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
          const data = await refreshToken(refresh);
          setStoredAuth({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
          });
          onTokenRefreshed(data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return axiosPrivate(originalRequest);
        } catch (refreshError) {
          setStoredAuth(null);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:logout"));
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    const message = getApiErrorMessage(error);
    useToastStore.getState().showToast(message, "error");
    return Promise.reject(error);
  }
);
