import Checkmark from "../../../../shared/ui/checkmark/checkmark";
import styles from "./BasketList.module.css";
import PropTypes from "prop-types";

const BasketList = () => {
  return (
    <div className={styles.basketList}>
      <div
        className={`${styles.basketListAction} d-flex align-items-center justify-content-between`}
      >
        <div className={`${styles.checkMarkContainer} d-flex gap-3 align-items-center`}>
          <Checkmark checked={true} />
          <p>Выбрать все</p>
        </div>
        <span>Удалить выбранные</span>
      </div>
      <div className={`${styles.basketListItems} d-flex flex-column gap-4`}>
        <BasketList />
        <BasketList />
        <BasketList />
        <BasketList />
        <BasketList />
      </div>
    </div>
  );
};

export default BasketList;
