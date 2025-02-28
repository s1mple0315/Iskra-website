import { useState } from "react";

import styles from "./BasketItem.module.css";
import FilterClose from "../../../../shared/ui/icons/Filters/FilterClose/FilterClose";
import BasketItemCounter from "../BasketItemCounter/BasketItemCounter";
import Checkmark from "../../../../shared/ui/checkmark/checkmark";

const BasketItem = () => {
  const [count, setCount] = useState(1);

  return (
    <div
      className={`${styles.basketItem} d-flex align-items-top justify-content-between position-relative`}
    >
      <div className={styles.checkMarkContainer}>
        <Checkmark checked={true} />
      </div>
      <div className={styles.basketItemImg}>
        <img src="" alt="" />
      </div>
      <div className={`${styles.basketItemInfo} d-flex flex-column`}>
        <div className={styles.basketItemDescription}>
          <p>Смартфон Apple iPhone 16 Plus 128 ГБ (Чёрный | Black)</p>
        </div>
        <div className={styles.basketItemId}>
          <span>#1648128</span>
        </div>
      </div>
      <div className={styles.basketItemQuantity}>
        <BasketItemCounter
          initialValue={count}
          onChange={setCount}
          minValue={1}
          maxValue={15}
        />
      </div>
      <div className={styles.basketItemPrice}>
        <h3>184 799₽</h3>
      </div>
      <div className={`${styles.basketItemDelete} position-absolute`}>
        <FilterClose />
      </div>
    </div>
  );
};

export default BasketItem;
