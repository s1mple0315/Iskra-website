import styles from "./StaticServices.module.css";

import QuickDelivery from "../../../../shared/ui/icons/static/bottomServices/quickDelivery/quickDelivery";
import SimpleReturn from "../../../../shared/ui/icons/static/bottomServices/simpleReturn/simpleReturn";
import Discount from "../../../../shared/ui/icons/static/bottomServices/discounts/discount";
import ConciergeService from "../../../../shared/ui/icons/static/bottomServices/conciergeService/conciergeService";

const StaticServices = () => {
  return (
    <div className={styles.staticServicesContainer}>
      <div className={styles.gridContainer}>
        <div className={styles.gridItem}>
          <div className={styles.iconContainer}>
            <QuickDelivery />
          </div>
          <h3>Быстрая доставка</h3>
          <p>Вслушивайтесь, и вы услышите как торопится наш курьер</p>
        </div>
        <div className={styles.gridItem}>
          <div className={styles.iconContainer}>
            <SimpleReturn />
          </div>
          <h3>Простой возврат</h3>
          <p>Мы поможем с этим, если что-то пошло не так</p>
        </div>
        <div className={styles.gridItem}>
          <div className={styles.iconContainer}>
            <Discount />
          </div>
          <h3>Скидки и акции</h3>
          <p>Каждый день, специально для вас</p>
        </div>
        <div className={styles.gridItem}>
          <div className={styles.iconContainer}>
            <ConciergeService />
          </div>
          <h3>Консьерж-сервис</h3>
          <p>Мы всегда готовы помочь вам</p>
        </div>
      </div>
    </div>
  );
};

export default StaticServices;