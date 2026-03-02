export const envConfig = {
  apiBaseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
  appEnv: import.meta.env.MODE,
  assetBaseUrl: import.meta.env.VITE_ASSET_BASE_URL || "http://localhost:3000",
};
