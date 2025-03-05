import { useState, useEffect } from "react";
import styles from "./ProfilePage.module.css";
import OrderHistory from "../../entities/components/OrderHistory/OrderHistory";
import useProfileStore from "../../config/api/Store/useProfileStore/useProfileStore";

const ProfilePage = () => {
  const { user, loading, error, fetchProfile, updateProfile } =
    useProfileStore();

  // Local state for input fields
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    lastname: "",
    birthdate: "",
    phoneNumber: "",
  });

  // Fetch user data when component mounts
  useEffect(() => {
    fetchProfile();
  }, []);

  // Sync local state with user data when fetched
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        lastname: user.lastname || "",
        birthdate: user.birthdate || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (update profile)
  const handleUpdate = async () => {
    await updateProfile(
      formData.name,
      formData.surname,
      formData.lastname,
      formData.birthdate
    );
  };

  return (
    <div>
      <h1>Личный кабинет</h1>
      <div className="d-flex justify-content-between gap-4">
        <div className={styles.userOrderHistory}>
          <OrderHistory />
        </div>

        <div className={styles.userData}>
          {loading ? (
            <p>Загрузка...</p>
          ) : (
            <>
              {error && <p className={styles.error}>{error}</p>}

              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Имя"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="surname"
                  placeholder="Фамилия"
                  value={formData.surname}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="lastname"
                  placeholder="Отчество"
                  value={formData.lastname}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  type="date"
                  name="birthdate"
                  placeholder="Дата рождения"
                  value={formData.birthdate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Мобильный телефон"
                  value={formData.phoneNumber}
                  disabled
                />
              </div>
              <button onClick={handleUpdate} disabled={loading}>
                {loading ? "Обновление..." : "Сохранить"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
