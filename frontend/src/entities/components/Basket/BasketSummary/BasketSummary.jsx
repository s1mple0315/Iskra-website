import { useState } from "react";
import styles from "./BasketSummary.module.css";
import useBasketStore from "../../../../config/api/Store/useBasketStore/useBasketStore"; // Adjust path
import { useNavigate } from "react-router-dom";

const BasketSummary = () => {
  const { items, getTotalItems, getTotalPrice, checkout } = useBasketStore();
  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = "user123"; // Replace with real auth logic

  const handleApplyPromo = () => {
    setError(promoCode ? "Promo applied (fake)" : "Invalid promo code");
    setPromoCode(""); 
  };

  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    navigate("/checkout"); // Navigate to checkout page
  };

  return (
    <div className={styles.basketSummary}>
      <div className={`${styles.summaryHeader} d-flex justify-content-between align-items-center`}>
        <h3>К оплате</h3>
        <p className={styles.totalPrice}>{parseFloat(getTotalPrice()).toLocaleString("ru-RU")} ₽</p>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <button
        className={styles.checkoutButton}
        onClick={handleProceedToCheckout}
      >
        {isLoading ? "Обработка..." : "Оформить заказ"}
      </button>
      <div className={styles.promoSection}>
        <input
          type="text"
          placeholder="Промокод"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          className={styles.promoInput}
        />
        <button
          className={styles.applyButton}
          onClick={handleApplyPromo}
          disabled={!promoCode || isLoading}
        >
          Применить
        </button>
      </div>
    </div>
  );
};

export default BasketSummary;