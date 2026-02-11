# React + TypeScript Admin Dashboard

Admin Dashboard for store management: products, orders, customers, promotions, inventory, content, and system configuration.

This project is built with **React + TypeScript**, designed for long-term maintainability and easy extensibility.

## ✨ Key Features

- Dashboard UI/UX following **Material UI (MUI)**
- Modular (lazy-loaded) routing with React Router
- Lightweight, domain-separated state management
- HTTP client with interceptors (auth/refresh token)
- Notification system (toast/snackbar)
- Enforced code style (ESLint + Prettier)
- Clear folder structure, easy for team scaling

---

## 🧱 Tech Stack

### Core

- **React** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool and dev server
- **MUI (Material UI)** — Main UI library (theme, components, layout)

### Routing & Data

- **React Router** — Routing
- **TanStack Query (React Query)** — Server state, caching, pagination, optimistic updates

### State Management

- **Zustand** — Client-side state (UI state, auth state, sidebar, theme mode, etc.)

### Networking

- **Axios** — HTTP client (with request/response interceptors)

### Form & Validation

- **React Hook Form** + **Zod** — Forms and validation

### Notifications

- React Toastify

### Linting & Formatting

- **ESLint** + **Prettier**

---

## 🚀 Getting Started

### Install

```bash
pnpm install
```

### Run Development Server

```bash
pnpm run dev
```

The app runs at: `http://localhost:5173`

### Build for Production

```bash
pnpm run build
```

### Preview Production Build

```bash
pnpm run preview
```

---

## 📁 Folder Structure

```bash
src/
├── apis/         # Axios instance, interceptors, API services
├── assets/       # Static assets (images, fonts)
├── components/   # Reusable UI components (MUI-based)
├────── layouts/  # Dashboard layout (sidebar, topbar, guards)
├────── common/   # Common components (button, input,...)
├── configs/      # App configs (env mapping, feature flags, etc.)
├── constants/    # Constants (routes, query keys, enums)
├── contexts/     # App providers (theme, auth, etc.)
├── hooks/        # Custom hooks
├── pages/        # Page modules (Products, Orders, Customers, etc.)
├── router/       # Route definitions & guards
├── stores/       # Zustand stores (auth, ui, settings)
├── theme/        # MUI theme (palette, typography, overrides)
├── types/        # Global/shared TS types
├── utils/        # Helpers (formatters, date, storage, etc.)
└── main.tsx      # App entry
```

---

## 🎨 MUI Theming

- Theme configuration is located in `src/theme/`
- Supports **light/dark mode**

Example import:

```tsx
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/theme";
```

---

## 🧭 Path Aliases

Use path aliases for cleaner imports:

```tsx
import { ROUTES_APP } from "@constants";
import { axiosClient } from "@apis";
import { DashboardLayout } from "@layouts";
```

Configured in `vite.config.ts`

---

## ✅ Scripts

- `pnpm dev` — Start dev server
- `pnpm build` — Production build
- `pnpm preview` — Preview build
- `pnpm lint` — Run ESLint
- `pnpm lint:fix` — Fix lint issues
- `pnpm format` — Run Prettier
