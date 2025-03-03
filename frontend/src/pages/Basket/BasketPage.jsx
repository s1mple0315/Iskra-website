import BasketList from "../../entities/components/Basket/BasketList/BasketList";
import BasketSummary from "../../entities/components/Basket/BasketSummary/BasketSummary"; 
import styles from "./BasketPage.module.css";

const BasketPage = () => {
  return (
    <div className={styles.basket}>
      <h1>Корзина</h1>
      <div className="d-flex justify-content-between gap-4">
        <div className={styles.basketItems}>
          <BasketList />
        </div>
        <div className={styles.basketSummary}>
          <BasketSummary /> 
        </div>
      </div>
    </div>
  );
};

export default BasketPage;