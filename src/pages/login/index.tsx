import { useState } from "react";

import { Link } from "react-router-dom";

import facebookIcon from "@assets/facebook.png";
import googleIcon from "@assets/google.png";
import { ROUTES_APP } from "@constants";
import useToastStore, { ToastState } from "@stores/toastStore";

import styles from "./index.module.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { showToast } = useToastStore((state: ToastState) => state);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10,11}$/;
    return emailRegex.test(email) || phoneRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      console.log("Invalid email or phone number format!");
      showToast("Invalid email or phone number format!", "error");
      return;
    }
    if (!validatePassword(password)) {
      showToast("Password must be at least 6 characters!", "error");
      return;
    }
    showToast("Login successful!", "success");
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>Authentication Application</div>
      <div className={styles.formContainer}>
        <h2 className={styles.signInText}>Sign in</h2>
        <button className={styles.oauthButton}>
          <img className={styles.oauthIcon} src={googleIcon} alt="Google" />
          <span>Continue with Google</span>
        </button>
        <button className={styles.oauthButton}>
          <img className={styles.oauthIcon} src={facebookIcon} alt="Facebook" />
          <span>Sign in with Facebook</span>
        </button>
        <div className={styles.orContainer}>
          <hr className={styles.line} />
          <span className={styles.orText}>or</span>
          <hr className={styles.line} />
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputContainer}>
            <input
              type="email"
              placeholder="Email or phone"
              className={styles.inputField}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.inputContainer}>
            <input
              type="password"
              placeholder="Password"
              className={styles.inputField}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <a href="/forgot-password" className={styles.forgotPassword}>
            Forgot password?
          </a>
          <button type="submit" className={styles.signInButton}>
            Sign in
          </button>
        </form>
        <div className={styles.joinNow}>
          New to Application?{" "}
          <Link to={ROUTES_APP.REGISTER} className={styles.joinLink}>
            Join now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
