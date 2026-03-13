import { Suspense } from "react";

import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import { ROLES_NAME, ROUTES_APP } from "@constants";
import AccountPage from "@pages/account";
import AddProductPage from "@pages/add-product";
import CategoriesPage from "@pages/categories";
import ErrorPage from "@pages/error";
import ForgotPasswordPage from "@pages/forgot-password";
import LoginPage from "@pages/login";
import ProductListPage from "@pages/product-list";
import RegisterPage from "@pages/register";
import UnauthorizedPage from "@pages/unauthorized";
import DashboardLayout from "@router/DashboardLayout";

import AppLayout from "./AppLayout";
import RoleBasedRoute from "./RoleBasedRoute";

const AppLoader = () => {
  return <></>;
};

const EmptyPage = () => {
  return <div>EmptyPage</div>;
};

const AppRouter = () => {
  const router = createBrowserRouter([
    {
      id: "app-router",
      path: ROUTES_APP.ROOT,
      element: <AppLayout />,
      ErrorBoundary: ErrorPage,
      children: [
        {
          index: true,
          element: <LoginPage />,
        },
        {
          path: ROUTES_APP.LOGIN,
          element: <LoginPage />,
        },
        {
          path: ROUTES_APP.REGISTER,
          element: <RegisterPage />,
        },
        {
          path: ROUTES_APP.FORGOT_PASSWORD,
          element: <ForgotPasswordPage />,
        },
        {
          path: ROUTES_APP.UNAUTHORIZED,
          element: <UnauthorizedPage />,
        },
        // @Private Layout
        {
          path: "",
          element: (
            <RoleBasedRoute allowedRoles={[ROLES_NAME.ADMIN]}>
              <DashboardLayout />
            </RoleBasedRoute>
          ),
          children: [
            /**
             * When user hits "/" but is already authenticated,
             * PrivateLayout can decide to render dashboard shell.
             * You can also redirect here if you want a fixed landing page.
             */
            {
              index: true,
              element: <Navigate to={ROUTES_APP.DASHBOARD} replace />,
            },
            { path: ROUTES_APP.DASHBOARD, element: <EmptyPage /> },
            { path: "/orders", element: <EmptyPage /> },
            { path: "/customers", element: <EmptyPage /> },
            { path: "/coupons", element: <EmptyPage /> },
            { path: ROUTES_APP.CATEGORIES, element: <CategoriesPage /> },
            { path: "/transactions", element: <EmptyPage /> },
            { path: "/products/new", element: <AddProductPage /> },
            { path: "/products", element: <ProductListPage /> },
            { path: "/admins", element: <EmptyPage /> },
            { path: "/admin-roles", element: <EmptyPage /> },
            {
              path: ROUTES_APP.ACCOUNT,
              element: <AccountPage />,
            },
          ],
        },
      ],
    },
  ]);

  return (
    <Suspense fallback={<AppLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default AppRouter;
