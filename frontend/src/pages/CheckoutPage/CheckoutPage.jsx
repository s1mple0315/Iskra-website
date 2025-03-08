import CheckoutTabs from "../../entities/components/CheckoutTabs/CheckoutTabs";
import Wallet from "../../shared/ui/icons/Checkout/Wallet/Wallet";
import styles from "./CheckoutPage.module.css";

const CheckoutPage = () => {
  return (
    <div className={styles}>
      <section></section>
      <section>
        <div className={styles.checkoutSteps}>
          <p>Шаг 1 из 3</p>
        </div>
        <div>
          <h3>Данные покупателя</h3>
          <div className={styles.customerDetails}>
            <div>
              <input type="text" placeholder="Телефон" />
            </div>
            <div>
              <input type="text" placeholder="Email (Не обязательно)" />
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className={styles.checkoutSteps}>
          <p>Шаг 2 из 3</p>
        </div>
        <div>
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
        <div>
          <h3>Выберите способ получения</h3>
          <div>
            <CheckoutTabs />
          </div>
        </div>
      </section>
      <section>
        <div className={`${styles.checkoutSummary} d-flex align-items-center justify-content-between`}>
          <div>
            <button className={styles.checkoutButton}>Оплатить заказ (184 799₽)</button>
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
                <span>184 000₽</span>
              </div>
              <div className={styles.costItem}>
                <p>Доставка</p>
                <span>799₽</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CheckoutPage;
