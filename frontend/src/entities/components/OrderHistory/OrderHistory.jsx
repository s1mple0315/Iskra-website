import styles from "./OrderHistory.module.css";

const OrderHistory = () => {
  return (
    <div className={styles.orderHistoryContainer}>
      <div className={styles.orderHistoryHeader}>
        <h1>Заказы</h1>
      </div>
      <div className={`${styles.orderHistoryList} d-flex flex-column gap-3`}>
        <div className={styles.orderHistoryItem}>
          <h2>
            Заказ от <span>17 ноябра, 2024 (184 799₽)</span>
          </h2>
          <div className={styles.orderHistoryProductsList}></div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
