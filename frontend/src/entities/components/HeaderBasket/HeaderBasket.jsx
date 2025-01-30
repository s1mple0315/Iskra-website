import styles from "./HeaderBasket.module.css";

import Basket from "../../../shared/ui/icons/Layout/Header/Basket/Basket";

const HeaderBasket = () => {
  return (
    <div className={`${styles.headerBasket} d-flex align-items-center`}>
      <div>
        <Basket />
        <span className={`${styles.badge} d-flex justify-content-center align-items-center`}>3</span>
      </div>
      <h3>Корзина</h3>
    </div>
  )
}

export default HeaderBasket
