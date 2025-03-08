import React, { useState } from "react";
import styles from "./CheckoutTabs.module.css"; // Import the CSS Module

const CheckoutTabs = () => {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState("delivery");

  const deliveryContent = (
    <div className={styles.tabContent}>
      <div className={styles.dropdownGroup}>
        <select title="Москва">
          <option value="moscow">Москва</option>
        </select>
      </div>
      <div className={styles.dropdownGroup}>
        <select title="Москва">
          <option value="cdek">СДЭК</option>
          <option value="post">Почта России</option>
        </select>
      </div>
      <div className={styles.dropdownGroup}>
        <select title="Выберите пункт...">
          <option value="">Выберите пункт...</option>
          <option value="point1">Пункт 1</option>
          <option value="point2">Пункт 2</option>
        </select>
      </div>
    </div>
  );

  const pickupContent = (
    <div className={styles.pickupContainer}>
      <div className={styles.mapSection}>
        <img
          src="https://via.placeholder.com/500x200"
          alt="Map of Moscow"
          className={styles.mapImage}
        />
      </div>
      <div className={styles.infoSection}>
        <div className={styles.infoItem}>
            <h3>8 800 758 00 00</h3>
            <p>Ежедневно с 9:00 до 22:00</p>
        </div>
        <div className={styles.infoItem}>
          <h3>Москва, Пушкина, 127</h3>
          <p>Главный офис</p>
        </div>
        <div className={styles.infoItem}>
          <h3>ISKRA@mail.ru</h3>
          <p>Наша почта</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsHeader}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "delivery" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("delivery")}
        >
          Доставка
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "pickup" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("pickup")}
        >
          Самовывоз
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabsContent}>
        {activeTab === "delivery" ? deliveryContent : pickupContent}
      </div>
    </div>
  );
};

export default CheckoutTabs;
