import { useState } from "react";

import { Link } from "react-router-dom";

import { ROUTES_APP } from "@constants";
import useToastStore, { ToastState } from "@stores/toastStore";

import styles from "./index.module.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");

  const { showToast } = useToastStore((state: ToastState) => state);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10,11}$/;
    return emailRegex.test(email) || phoneRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      console.log("Invalid email or phone number format!");
      showToast("Invalid email or phone number format!", "error");
      return;
    }
    showToast("OTP code sent successfully!", "success");
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.forgotPasswordText}>Forgot password</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputContainer}>
            <input
              type="email"
              placeholder="Email or phone"
              className={styles.inputField}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <p className={styles.description}>
            We’ll send a verification code to this email or phone number if it
            matches an existing Application account.
          </p>
          <button type="submit" className={styles.nextButton}>
            Next
          </button>
          <Link to={ROUTES_APP.LOGIN} className={styles.backButton}>
            Back
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
