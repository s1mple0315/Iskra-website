import BasketList from "../../entities/components/Basket/BasketList/BasketList";
import BasketSummary from "../../entities/components/Basket/BasketSummary/BasketSummary"; 
import styles from "./BasketPage.module.css";

const BasketPage = () => {
  return (
    <div className={styles.basket}>
      <h1>Корзина</h1>
      <div className="d-flex justify-content-between">
        <div>
          <BasketList />
        </div>
        <div>
          <BasketSummary /> 
        </div>
      </div>
    </div>
  );
};

export default BasketPage;