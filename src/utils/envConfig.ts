export const envConfig = {
  apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
  appEnv: import.meta.env.MODE,
};