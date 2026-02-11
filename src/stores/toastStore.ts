import { create } from "zustand";

export interface ToastState {
  message: string | null;
  type: "success" | "error" | "warning" | null;
  showToast: (message: string, type: "success" | "error" | "warning") => void;
  hideToast: () => void;
}

const useToastStore = create<ToastState>(set => ({
  message: null,
  type: null,
  showToast: (message, type) => set({ message, type }),
  hideToast: () => set({ message: null, type: null }),
}));

export default useToastStore;
