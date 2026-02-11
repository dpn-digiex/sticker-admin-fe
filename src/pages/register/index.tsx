import { useState } from "react";

import { Link } from "react-router-dom";

import facebookIcon from "@assets/facebook.png";
import googleIcon from "@assets/google.png";
import { ROUTES_APP } from "@constants";
import useToastStore, { ToastState } from "@stores/toastStore";

import styles from "./index.module.css";

type RegisterStages =
  | "fill:email/password"
  | "fill:personal-info"
  | "quizz:security";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    keepMeLoggedIn: false,
    firstName: "",
    lastName: "",
  });
  const [registerStages, setRegisterStages] = useState<RegisterStages>(
    "fill:email/password"
  );

  const { showToast } = useToastStore((state: ToastState) => state);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10,11}$/;
    return emailRegex.test(email) || phoneRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateUsername = (username: string) => {
    const isNotEmpty = username.length > 0;
    const isNotSpecialCharacters = /^[a-zA-Z]+$/.test(username);
    return isNotEmpty && isNotSpecialCharacters;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerStages === "fill:email/password") {
      if (!validateEmail(formData.email)) {
        console.log("Invalid email or phone number format!");
        showToast("Invalid email or phone number format!", "error");
        return;
      }
      if (!validatePassword(formData.password)) {
        showToast("Password must be at least 6 characters!", "error");
        return;
      }
      setRegisterStages("fill:personal-info");
    } else if (registerStages === "fill:personal-info") {
      if (!validateUsername(formData.firstName)) {
        showToast(
          "First name must not empty and contain special characters/numbers!",
          "error"
        );
        return;
      }
      if (!validateUsername(formData.lastName)) {
        showToast(
          "Last name must not empty and contain special characters/numbers!",
          "error"
        );
        return;
      }
      setRegisterStages("quizz:security");
    } else {
      console.log("formData", formData);
      showToast("Login successful!", "success");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>Register new account</div>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          {registerStages === "fill:email/password" && (
            <>
              <div className={styles.inputContainer}>
                <p className={styles.titleInput}>Email</p>
                <input
                  key={"email"}
                  type="email"
                  placeholder="Email"
                  className={styles.inputField}
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className={styles.inputContainer}>
                <p className={styles.titleInput}>Password (6+ characters)</p>
                <input
                  key={"password"}
                  type="password"
                  placeholder="Password"
                  className={styles.inputField}
                  value={formData.password}
                  onChange={e =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className={styles.keepMeLoggedInWrapper}>
                <input
                  type="checkbox"
                  key={"keepMeLoggedIn"}
                  checked={formData.keepMeLoggedIn}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      keepMeLoggedIn: e.target.checked,
                    })
                  }
                />
                <p className={styles.keepMeLoggedInTitle}>Keep me logged in</p>
              </div>
            </>
          )}
          {(registerStages === "fill:personal-info" ||
            registerStages === "quizz:security") && (
            <>
              <div className={styles.inputContainer}>
                <p className={styles.titleInput}>First name</p>
                <input
                  key={"firstName"}
                  type="text"
                  placeholder="First name"
                  className={styles.inputField}
                  value={formData.firstName}
                  onChange={e =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div className={styles.inputContainer}>
                <p className={styles.titleInput}>Last name</p>
                <input
                  key={"lastName"}
                  type="text"
                  placeholder="Last name"
                  className={styles.inputField}
                  value={formData.lastName}
                  onChange={e =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </>
          )}
          <button type="submit" className={styles.signInButton}>
            {registerStages === "fill:email/password"
              ? "Agree & Join"
              : "Continue"}
          </button>
        </form>

        {registerStages === "fill:email/password" && (
          <>
            <div className={styles.orContainer}>
              <hr className={styles.line} />
              <span className={styles.orText}>or</span>
              <hr className={styles.line} />
            </div>
            <button className={styles.oauthButton}>
              <img className={styles.oauthIcon} src={googleIcon} alt="Google" />
              <span>Continue with Google</span>
            </button>
            <button className={styles.oauthButton}>
              <img
                className={styles.oauthIcon}
                src={facebookIcon}
                alt="Facebook"
              />
              <span>Sign in with Facebook</span>
            </button>
            <div className={styles.joinNow}>
              Already have an account?{" "}
              <Link to={ROUTES_APP.LOGIN} className={styles.joinLink}>
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
