import styles from "./HeaderProfile.module.css";

import Personal from "../../../shared/ui/icons/Layout/Header/Personal/Personal";

const HeaderProfile = () => {
  return (
    <div className={`${styles.headerProfile} d-flex align-items-center justify-content-center`}>
      <Personal />
      <h3>Войти</h3>
    </div>
  );
};

export default HeaderProfile;
