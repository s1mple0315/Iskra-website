import { useState } from "react";
import useBasketStore from "../../config/api/Store/useBasketStore/useBasketStore";
import CheckoutTabs from "../../entities/components/CheckoutTabs/CheckoutTabs";
import Wallet from "../../shared/ui/icons/Checkout/Wallet/Wallet";
import styles from "./CheckoutPage.module.css";

const CheckoutPage = () => {
  const { checkout, items, clearBasket, getTotalPrice, getTotalItems } = useBasketStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  

  const [customerData, setCustomerData] = useState({
    phone: "",
    email: "",
    address: "г. Москва, ул. Ленина, д. 10", // ✅ Default address for testing
    paymentMethod: "cash",
  });

  const handleChange = (e) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    if (!customerData.phone) {
      setError("Пожалуйста, заполните обязательные поля (телефон)");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const order = await checkout("user123", customerData.address);
      clearBasket();
    } catch (err) {
      setError(err.message || "Ошибка при оформлении заказа");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.checkoutPage}>
      <section className={styles.checkoutPageHeader}>
        <h3>Оформление</h3>
        <p>Оформляем <span>{getTotalItems()} товаров ({getTotalPrice()}₽)</span></p>
      </section>
      <section>
        <div className={styles.checkoutSteps}>
          <p>Шаг 1 из 3</p>
        </div>
        <div className={styles.checkoutStepsData}>
          <h3>Данные покупателя</h3>
          <div className={styles.customerDetails}>
            <div>
              <input
                type="text"
                name="phone"
                placeholder="Телефон"
                value={customerData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email (Не обязательно)"
                value={customerData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className={styles.checkoutSteps}>
          <p>Шаг 2 из 3</p>
        </div>
        <div className={styles.checkoutStepsData}>
          <h3>Выберите способ оплаты</h3>
          <div
            className={`${styles.paymentMethod} d-flex flex-column align-items-center justify-content-center`}
          >
            <Wallet />
            <p>Наличными при получении</p>
          </div>
        </div>
      </section>
      <section>
        <div className={styles.checkoutSteps}>
          <p>Шаг 3 из 3</p>
        </div>
        <div className={styles.checkoutStepsData}>
          <h3>Выберите способ получения</h3>
          <CheckoutTabs />
        </div>
      </section>
      <section>
        <div
          className={`${styles.checkoutSummary} d-flex align-items-center justify-content-between`}
        >
          <div>
            <button
              className={styles.checkoutButton}
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "Обрабатывается..." : `Оплатить заказ (${getTotalPrice()}₽)`}
            </button>
          </div>
          <div className={`${styles.terms} d-flex justify-content-between`}>
            <div className={styles.termsText}>
              <p>
                Нажимая «оплатить заказ» Вы соглашаетесь с условиями политики
                конфиденциальности и правилами продажи.
              </p>
            </div>
            <div className="d-flex gap-3">
              <div className={styles.costItem}>
                <p>Стоимость товаров</p>
                <span>{getTotalPrice()}₽</span>
              </div>
              <div className={styles.costItem}>
                <p>Доставка</p>
                <span>799₽</span>
              </div>
            </div>
          </div>
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </section>
    </div>
  );
};

export default CheckoutPage;
