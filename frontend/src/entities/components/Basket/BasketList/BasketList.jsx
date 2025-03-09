import { useState } from "react";
import Checkmark from "../../../../shared/ui/checkmark/checkmark";
import styles from "./BasketList.module.css";
import BasketItem from "../BasketItem/BasketItem";
import useBasketStore from "../../../../config/api/Store/useBasketStore/useBasketStore";

const BasketList = () => {
  const { items, removeItem } = useBasketStore();
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectAll = () => {
    if (selectedItems.length === (items?.length || 0)) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items?.map((item) => item.id) || []);
    }
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach((id) => removeItem(id));
    setSelectedItems([]);
  };

  const toggleItemSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.basketList}>
      {items && Array.isArray(items) && items.length > 0 && (
        <div
          className={`${styles.basketListAction} d-flex align-items-center justify-content-between`}
        >
          <div
            className={`${styles.checkMarkContainer} d-flex gap-3 align-items-center`}
          >
            <Checkmark
              checked={
                selectedItems.length === items.length && items.length > 0
              }
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
        {items && Array.isArray(items) && items.length === 0 ? (
          <p>Корзина пуста</p>
        ) : items && Array.isArray(items) ? (
          items.map((item) => (
            <BasketItem
              key={item.id}
              item={item}
              isSelected={selectedItems.includes(item.id)}
              onToggleSelection={toggleItemSelection}
            />
          ))
        ) : (
          <p>Ошибка: Данные корзины недоступны</p>
        )}
      </div>
    </div>
  );
};

export default BasketList;
