import { useState, useEffect } from "react";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import axios from "axios";
import styles from "./AuthModal.module.css";

const firebaseConfig = {
  apiKey: "AIzaSyDA01TQxy3WA-izrSJsQASYwqSBGCxmN0Y",
  authDomain: "iskra-e-commerce.firebaseapp.com",
  projectId: "iskra-e-commerce",
  storageBucket: "iskra-e-commerce.appspot.com",
  messagingSenderId: "1046589607815",
  appId: "1:1046589607815:web:78721fb448d819fa080d22",
  measurementId: "G-1CV8RK2EDH",
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

auth.settings.appVerificationDisabledForTesting = true;

const AuthModal = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth, // <-- Передаём auth напрямую
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
          },
          "expired-callback": () => {
            setError("reCAPTCHA expired, please refresh the page.");
          },
        }
      );
      window.recaptchaVerifier.render();
    }
  }, []);

  if (!isOpen) return null;

  const sendOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!phoneNumber.match(/^\+\d{10,15}$/)) {
        throw new Error("Введите корректный номер в формате +1234567890");
      }

      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );

      setConfirmation(confirmationResult);
    } catch (err) {
      setError("Ошибка при отправке OTP: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!confirmation) {
        throw new Error("Код не отправлен. Попробуйте снова.");
      }

      const credential = await confirmation.confirm(code);
      setUser(credential.user);

      // Регистрация в вашем API
      const response = await axios.post(
        "http://localhost:8001/api/v1/auth/register",
        {
          phoneNumber: phoneNumber,
          full_name: "User Name",
          role: "user",
        }
      );
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        console.error("❌ No token received from backend:", response.data);
      }

      onClose();
    } catch (err) {
      setError("Ошибка проверки OTP: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Войти или зарегистрироваться</h2>
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Введите номер (например, +1234567890)"
          className={styles.inputField}
          disabled={loading}
        />
        {!confirmation && (
          <button
            onClick={sendOTP}
            className={styles.getCodeButton}
            disabled={loading || !phoneNumber}
          >
            {loading ? "Отправка..." : "Получить код"}
          </button>
        )}
        {confirmation && (
          <>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Введите код"
              className={styles.inputField}
              disabled={loading}
            />
            <button
              onClick={verifyOTP}
              className={styles.getCodeButton}
              disabled={loading || !code}
            >
              {loading ? "Проверка..." : "Подтвердить"}
            </button>
          </>
        )}
        <div id="recaptcha-container" className={styles.recaptcha}></div>
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.instructions}>
          Нажимая "Получить код", вы соглашаетесь с условиями использования.
        </p>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
