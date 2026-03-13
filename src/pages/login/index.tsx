import { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";

import { login } from "@apis/auth.api";
import { setStoredAuth } from "@apis/authStorage";
import facebookIcon from "@assets/facebook.png";
import googleIcon from "@assets/google.png";
import { ROUTES_APP } from "@constants";
import useAuth from "@hooks/useAuth";
import useToastStore, { ToastState } from "@stores/toastStore";
import { getApiErrorMessage } from "@utils";

import styles from "./index.module.css";

const TemporaryRedirectContainer = () => {
  return (
    <Link to={ROUTES_APP.DASHBOARD}>
      <button
        type="button"
        style={{
          background: "transparent",
          border: "1px solid #0a66c2",
          color: "#0a66c2",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          marginTop: "20px",
        }}
      >
        Go to Dashboard
      </button>
    </Link>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { auth, setAuth, isCheckingAuth } = useAuth();
  const { showToast } = useToastStore((state: ToastState) => state);

  useEffect(() => {
    if (!isCheckingAuth && auth?.roles?.length && auth?.accessToken) {
      navigate(ROUTES_APP.DASHBOARD, { replace: true });
    }
  }, [isCheckingAuth, auth?.roles, auth?.accessToken, navigate]);

  const validateEmail = (value: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10,11}$/;
    return emailRegex.test(value) || phoneRegex.test(value);
  };

  const validatePassword = (value: string) => {
    return value.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      showToast("Invalid email or phone number format!", "error");
      return;
    }
    if (!validatePassword(password)) {
      showToast("Password must be at least 6 characters!", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await login({ email: email.trim(), password });
      setStoredAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
      setAuth({
        roles: data.user.role === "owner" ? ["admin"] : ["user"],
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        },
      });
      showToast("Login successful!", "success");
      navigate(ROUTES_APP.DASHBOARD, { replace: true });
    } catch (err) {
      showToast(
        getApiErrorMessage(err) ||
          "Invalid email or password. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <button
            type="submit"
            className={styles.signInButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className={styles.joinNow}>
          New to Application?{" "}
          <Link to={ROUTES_APP.REGISTER} className={styles.joinLink}>
            Join now
          </Link>
        </div>
      </div>
      <TemporaryRedirectContainer />
    </div>
  );
};

export default LoginPage;
