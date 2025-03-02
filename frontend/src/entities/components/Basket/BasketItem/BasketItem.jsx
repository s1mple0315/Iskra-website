import styles from "./BasketItem.module.css";
import FilterClose from "../../../../shared/ui/icons/Filters/FilterClose/FilterClose";
import BasketItemCounter from "../BasketItemCounter/BasketItemCounter";
import Checkmark from "../../../../shared/ui/checkmark/checkmark";
import useBasketStore from "../../../../config/api/Store/useBasketStore/useBasketStore"; 

const BasketItem = ({ item, isSelected, onToggleSelection }) => {
  const { updateQuantity, removeItem } = useBasketStore();

  const handleQuantityChange = (newCount) => {
    updateQuantity(item.id, newCount);
  };

  const handleDelete = () => {
    removeItem(item.id);
  };

  return (
    <div
      className={`${styles.basketItem} d-flex align-items-top justify-content-between position-relative`}
    >
      <div className={styles.checkMarkContainer}>
        <Checkmark
          checked={isSelected}
          onChange={() => onToggleSelection(item.id)}
        />
      </div>
      <div className={styles.basketItemImg}>
        <img src={item.images?.[0] || ""} alt={item.name} /> {/* Use first image */}
      </div>
      <div className={`${styles.basketItemInfo} d-flex flex-column`}>
        <div className={styles.basketItemDescription}>
          <p>{item.name}</p>
        </div>
        <div className={styles.basketItemId}>
          <span>#{item.id}</span> {/* Assuming id is unique */}
        </div>
      </div>
      <div className={styles.basketItemQuantity}>
        <BasketItemCounter
          initialValue={item.quantity}
          onChange={handleQuantityChange}
          minValue={1}
          maxValue={15} // Adjust based on stock if available
        />
      </div>
      <div className={styles.basketItemPrice}>
        <h3>{(item.price * item.quantity).toLocaleString("ru-RU")}₽</h3>
      </div>
      <div className={`${styles.basketItemDelete} position-absolute`}>
        <FilterClose onClick={handleDelete} />
      </div>
    </div>
  );
};

export default BasketItem;