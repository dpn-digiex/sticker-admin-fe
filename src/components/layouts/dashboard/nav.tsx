import type { ReactNode } from "react";

import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

export type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "MAIN MENU",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: <DashboardOutlinedIcon /> },
      {
        label: "Order Management",
        to: "/orders",
        icon: <ShoppingBagOutlinedIcon />,
      },
      { label: "Customers", to: "/customers", icon: <PeopleOutlineIcon /> },
      {
        label: "Coupon Code",
        to: "/coupons",
        icon: <LocalOfferOutlinedIcon />,
      },
      {
        label: "Categories",
        to: "/categories",
        icon: <CategoryOutlinedIcon />,
      },
      {
        label: "Transaction",
        to: "/transactions",
        icon: <ReceiptLongOutlinedIcon />,
      },
      { label: "Brand", to: "/brands", icon: <StorefrontOutlinedIcon /> },
    ],
  },
  {
    title: "PRODUCTS",
    items: [
      {
        label: "Add Products",
        to: "/products/new",
        icon: <AddBoxOutlinedIcon />,
      },
      {
        label: "Product List",
        to: "/products",
        icon: <Inventory2OutlinedIcon />,
      },
    ],
  },
  {
    title: "ADMIN",
    items: [
      {
        label: "Manage Admins",
        to: "/admins",
        icon: <AdminPanelSettingsOutlinedIcon />,
      },
      { label: "Admin Roles", to: "/admin-roles", icon: <BadgeOutlinedIcon /> },
    ],
  },
];
