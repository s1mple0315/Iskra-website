import BasketList from "../../entities/components/Basket/BasketList/BasketList";
import styles from "./BasketPage.module.css";

const BasketPage = () => {
  return (
    <div className={styles.basket}>
      <h1>Корзина</h1>
        <div>
            <div><BasketList /></div>
            <div></div>
        </div>
    </div>
  );
};

export default BasketPage;
