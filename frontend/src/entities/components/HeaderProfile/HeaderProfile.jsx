import { useState } from "react";
import styles from "./HeaderProfile.module.css";
import Personal from "../../../shared/ui/icons/Layout/Header/Personal/Personal";
import AuthModal from "../AuthModal/AuthModal"; // Adjust path

const HeaderProfile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className={`${styles.headerProfile} d-flex align-items-center justify-content-center`}>
      <Personal onClick={openModal} />
      <h3 onClick={openModal}>Войти</h3>
      {isModalOpen && <AuthModal isOpen={isModalOpen} onClose={closeModal} />}
    </div>
  );
};

export default HeaderProfile;