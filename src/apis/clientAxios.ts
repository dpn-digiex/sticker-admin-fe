import axios from "axios";

import useToastStore from "@stores/toastStore";
import { getApiErrorMessage } from "@utils";

// Create axios instance with default config
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const axiosPublic = axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// set multipart/form-data with boundary when sending FormData
axiosPrivate.interceptors.request.use(config => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Global error handling: show toast for any API error
axiosPrivate.interceptors.response.use(
  res => res,
  error => {
    const message = getApiErrorMessage(error);
    useToastStore.getState().showToast(message, "error");
    return Promise.reject(error);
  }
);
