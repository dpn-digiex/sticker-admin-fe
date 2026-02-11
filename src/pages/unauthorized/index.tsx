import { useNavigate } from "react-router-dom";

import styles from "./index.module.css";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>🚫</div>
        <h1 className={styles.title}>Unauthorized</h1>
        <p className={styles.message}>
          You do not have access to the requested page. Please contact your
          administrator if you believe this is an error.
        </p>
        <button className={styles.goBackButton} onClick={goBack}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
