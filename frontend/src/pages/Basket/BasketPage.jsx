import BasketList from '../../entities/components/Basket/BasketList/BasketList';
import BasketSummary from '../../entities/components/Basket/BasketSummary/BasketSummary';
import styles from './BasketPage.module.css';
import { useNavigate } from 'react-router-dom';
import useBasketStore from '../../config/api/Store/useBasketStore/useBasketStore'; // Adjust path

const BasketPage = () => {
  const navigate = useNavigate();
  const { items } = useBasketStore();

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      alert('Your basket is empty!');
      return;
    }
    navigate('/checkout', { state: { fromBasket: true } }); // Pass state to trigger checkout
  };

  return (
    <div className={styles.basket}>
      <h1>Корзина</h1>
      <div className="d-flex justify-content-between gap-4">
        <div className={styles.basketItems}>
          <BasketList />
        </div>
        <div className={styles.basketSummary}>
          <BasketSummary onProceedToCheckout={handleProceedToCheckout} />
        </div>
      </div>
    </div>
  );
};

export default BasketPage;