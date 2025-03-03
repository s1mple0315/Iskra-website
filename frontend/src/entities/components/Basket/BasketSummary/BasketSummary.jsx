import { useState } from "react";
import styles from "./BasketSummary.module.css";
import useBasketStore from "../../../../config/api/Store/useBasketStore/useBasketStore"; // Adjust path

const BasketSummary = () => {
  const { items, getTotalItems, getTotalPrice, checkout } = useBasketStore();
  const [shippingAddress, setShippingAddress] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = "user123"; // Replace with real auth logic

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (items.length === 0) throw new Error("Basket is empty");
      if (!shippingAddress) throw new Error("Shipping address is required");
      await checkout(userId, shippingAddress);
      alert("Заказ успешно создан!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPromo = () => {
    setError(promoCode ? "Promo applied (fake)" : "Invalid promo code");
    setPromoCode(""); 
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
        onClick={handleCheckout}
        disabled={items.length === 0 || !shippingAddress || isLoading}
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
      <div className={styles.shippingSection}>
        <input
          type="text"
          placeholder="Адрес доставки"
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          className={styles.shippingInput}
        />
      </div>
    </div>
  );
};

export default BasketSummary;