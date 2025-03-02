import { useState } from "react";
import styles from "./BasketSummary.module.css";
import useBasketStore from "../../../../config/api/Store/useBasketStore/useBasketStore"; 

const BasketSummary = () => {
  const { items, getTotalItems, getTotalPrice, checkout } = useBasketStore();
  const [shippingAddress, setShippingAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const userId = "user123"; 

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await checkout(userId, shippingAddress);
      alert("Заказ успешно создан!"); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.basketSummary} d-flex flex-column`}>
      <div className={styles.basketSummaryUpper}>
        <h3>Итого</h3>
        <p>Товары: {getTotalItems()}</p>
        <p>Сумма: {parseFloat(getTotalPrice()).toLocaleString("ru-RU")}₽</p>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      <div className={styles.basketSummaryBottom}>
        <input
          type="text"
          placeholder="Адрес доставки"
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          className={styles.shippingInput}
        />
        <button
          onClick={handleCheckout}
          disabled={items.length === 0 || !shippingAddress || isLoading}
          className={styles.checkoutButton}
        >
          {isLoading ? "Обработка..." : "Оформить заказ"}
        </button>
      </div>
    </div>
  );
};

export default BasketSummary;