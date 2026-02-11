export const ROUTES_APP = {
  ROOT: "/",
  ADMIN: "/admin",
  AUTH: "/auth",
  PRIVATE: "/private",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  UNAUTHORIZED: "/unauthorized",
  ACCOUNT: "account",
  DASHBOARD: "/dashboard",
  CATEGORIES: "/categories",
};

export const USER_API = {
  SIGNIN: "/auth/signin",
  LOGOUT: "/auth/logout",
};

// Roles id defined in database
export const ROLES = {
  ADMIN: 202,
  EDITOR: 203,
  USER: 204,
  ACCESS_ALL: 205,
};

export const ROLES_NAME = {
  ADMIN: "admin",
  EDITOR: "editor",
  USER: "user",
  ACCESS_ALL: "*",
};

export const DEFAULT_MAX_FILE_SIZE_MB = 5;
export const DEFAULT_MAX_FILES = 10;
export const DEFAULT_ACCEPT = "image/jpeg,image/png,image/gif,image/webp";
export const DEFAULT_PREFIX = "tmp";

export const PRODUCTS_PREFIX = "products";
export const CATEGORIES_PREFIX = "categories";
export const MAX_PRODUCT_IMAGES = 10;
