import React, { useEffect } from "react";

import { ToastContainer, toast } from "react-toastify";

import useToastStore, { ToastState } from "@stores/toastStore";

import "react-toastify/dist/ReactToastify.css";

const ToastNotifyWrapper: React.FC = () => {
  const { message, type, hideToast } = useToastStore(
    (state: ToastState) => state
  );

  useEffect(() => {
    if (message && type) {
      if (type === "success") {
        toast.success(message);
      } else if (type === "error") {
        toast.error(message);
      } else if (type === "warning") {
        toast.warning(message);
      }
      hideToast();
    }
  }, [message, type, hideToast]);

  return (
    <ToastContainer position="top-right" autoClose={4000} hideProgressBar />
  );
};

export default ToastNotifyWrapper;
