import styles from "./BurgerMenu.module.css";

import Burger from "../../../shared/ui/icons/Layout/Header/Burger/Burger";

const BurgerMenu = () => {
  return (
    <div className={`${styles.burgerMenu} d-flex justify-content-between align-items-center`}>
      <Burger />
      <h3>Каталог товаров</h3>
    </div>
  );
};

export default BurgerMenu;
