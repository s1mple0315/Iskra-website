import { useState } from "react";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import axios from "axios";
import styles from "./AuthModal.module.css";

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const OTPLogin = () => {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const sendOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      const recaptcha = new RecaptchaVerifier("recaptcha-container", {}, auth);
      const phoneNumber = phoneOrEmail.startsWith("+")
        ? phoneOrEmail
        : `+${phoneOrEmail}`;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptcha
      );
      setConfirmation(confirmationResult);
    } catch (err) {
      setError("Failed to send OTP: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      const credential = await confirmation.confirm(code);
      setUser(credential.user); 
      const response = await axios.post("/api/v1/auth/register", {
        phoneNumber: phoneOrEmail.startsWith("+")
          ? phoneOrEmail
          : `+${phoneOrEmail}`,
        full_name: "User Name", 
        role: "user",
      });
      localStorage.setItem("token", response.data.token);
      console.log("User registered:", response.data);
    } catch (err) {
      setError("Invalid OTP or registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.otpContainer}>
      <h2>Войти или зарегистрироваться</h2>
      <input
        type="text"
        value={phoneOrEmail}
        onChange={(e) => setPhoneOrEmail(e.target.value)}
        placeholder="Телефон или E-mail"
        className={styles.inputField}
        disabled={loading}
      />
      {!confirmation && (
        <button
          onClick={sendOTP}
          className={styles.getCodeButton}
          disabled={loading || !phoneOrEmail}
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
      <div className={styles.socialLogin}>
        {/* <VKIcon className={styles.socialIcon} /> */}
        {/* <GoogleIcon className={styles.socialIcon} /> */}
      </div>
      <p className={styles.instructions}>
        Нажимая кнопку &quot;Получить код&quot;, вы соглашаетесь с условиями использования
        и политикой конфиденциальности
      </p>
    </div>
  );
};

export default OTPLogin;
