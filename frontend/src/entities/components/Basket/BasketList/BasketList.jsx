import { useState } from "react";
import Checkmark from "../../../../shared/ui/checkmark/checkmark";
import styles from "./BasketList.module.css";
import BasketItem from "../BasketItem/BasketItem";
import useBasketStore from "../../../../config/api/Store/useBasketStore/useBasketStore"; // Adjust path to your store

const BasketList = () => {
  const { items, removeItem } = useBasketStore();
  const [selectedItems, setSelectedItems] = useState([]); // Track selected item IDs

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]); // Deselect all
    } else {
      setSelectedItems(items.map((item) => item.id)); // Select all
    }
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach((id) => removeItem(id));
    setSelectedItems([]); // Clear selection after deletion
  };

  const toggleItemSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.basketList}>
      {items.length > 0 && (
        <div
          className={`${styles.basketListAction} d-flex align-items-center justify-content-between`}
        >
          <div
            className={`${styles.checkMarkContainer} d-flex gap-3 align-items-center`}
          >
            <Checkmark
              checked={selectedItems.length === items.length && items.length > 0}
              onChange={handleSelectAll}
            />
            <p>Выбрать все</p>
          </div>
          <span
            className={selectedItems.length === 0 ? styles.disabled : ""}
            onClick={selectedItems.length > 0 ? handleDeleteSelected : null}
          >
            Удалить выбранные
          </span>
        </div>
      )}
      <div className={`${styles.basketListItems} d-flex flex-column gap-4`}>
        {items.length === 0 ? (
          <p>Корзина пуста</p>
        ) : (
          items.map((item) => (
            <BasketItem
              key={item.id}
              item={item}
              isSelected={selectedItems.includes(item.id)}
              onToggleSelection={toggleItemSelection}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BasketList;