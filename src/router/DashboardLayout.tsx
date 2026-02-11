import * as React from "react";

import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";

import { Sidebar } from "@components/layouts/dashboard/Sidebar";
import { Topbar } from "@components/layouts/dashboard/Topbar";

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED_WIDTH = 76;

function titleFromPath(pathname: string) {
  if (pathname.startsWith("/orders")) return "Order Management";
  if (pathname.startsWith("/customers")) return "Customers";
  if (pathname.startsWith("/coupons")) return "Coupon Code";
  if (pathname.startsWith("/categories")) return "Categories";
  if (pathname.startsWith("/transactions")) return "Transaction";
  if (pathname.startsWith("/brands")) return "Brand";
  if (pathname.startsWith("/products/new")) return "Add Products";
  if (pathname.startsWith("/products")) return "Product List";
  if (pathname.startsWith("/admins")) return "Manage Admins";
  if (pathname.startsWith("/admin-roles")) return "Admin Roles";
  return "Dashboard";
}

export default function DashboardLayout() {
  const location = useLocation();

  // Desktop sidebar open/collapse
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  // Mobile drawer
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const pageTitle = titleFromPath(location.pathname);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F6F7FB" }}>
      <Sidebar
        width={DRAWER_WIDTH}
        collapsedWidth={DRAWER_COLLAPSED_WIDTH}
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        onToggleOpen={() => setSidebarOpen(v => !v)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          transition: t =>
            t.transitions.create("margin-left", {
              easing: t.transitions.easing.sharp,
              duration: t.transitions.duration.shortest,
            }),
        }}
      >
        <Topbar title={pageTitle} onOpenMobile={() => setMobileOpen(true)} />

        {/* Content area (ignore page content; this is the slot) */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
