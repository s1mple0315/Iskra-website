import { useState } from "react"; 
import useProfileStore from "../../config/api/Store/useProfileStore/useProfileStore"; 
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePage.module.css";

const Profile = () => {
  const { user, loading, error, fetchProfile, updateProfile, clearProfile } = useProfileStore();
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  if (!user && !loading && !error) {
    fetchProfile();
  }

  const handleUpdate = (e) => {
    e.preventDefault();
    updateProfile(fullName, role);
  };

  const handleLogout = () => {
    clearProfile();
    navigate("/");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>Please log in to view your profile.</div>;

  return (
    <div className={styles.profileContainer}>
      <h2>Профиль</h2>
      <form onSubmit={handleUpdate} className={styles.profileForm}>
        <div>
          <label>Телефон:</label>
          <p>{user.phoneNumber}</p>
        </div>
        <div>
          <label>Полное имя:</label>
          <input
            type="text"
            value={fullName || user.full_name || ""}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label>Роль:</label>
          <input
            type="text"
            value={role || user.role || ""}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
        <button type="button" onClick={handleLogout} className={styles.logoutButton}>
          Выйти
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default Profile;