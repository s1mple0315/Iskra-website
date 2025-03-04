import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HeaderProfile.module.css";
import Personal from "../../../shared/ui/icons/Layout/Header/Personal/Personal";
import AuthModal from "../AuthModal/AuthModal"; // Adjust path

const HeaderProfile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in (token exists)
    const token = localStorage.getItem("token");
    if (!token) setIsModalOpen(false); // Ensure modal is closed if no token
  }, []);

  const openModal = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  const goToProfile = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/profile");
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div
      className={`${styles.headerProfile} d-flex align-items-center justify-content-center`}
    >
      <Personal onClick={goToProfile} />
      <h3 onClick={goToProfile}>
        {localStorage.getItem("token") ? "Profile" : "Войти"}
      </h3>
      {isModalOpen && <AuthModal isOpen={isModalOpen} onClose={closeModal} />}
    </div>
  );
};

export default HeaderProfile;
