import InfoDisplay from "../../entities/components/InfoDisplay/InfoDisplay";
import StaticServices from "../../entities/components/static/staticServices/StaticServices";
import styles from "./Contacts.module.css";

const Contacts = () => {
  return (
    <div className={`${styles.contactsPage} d-flex flex-column `}>
      <div className="d-flex justify-content-between mb-5">
        <h3>Контакты</h3> 
        <div className="d-flex gap-2">
          <InfoDisplay title={'8 800 758 00 00'} text={'Ежедневно с 9:00 до 22:00'}/>
          <InfoDisplay title={'Москва, Пушкина, 127'} text={'Главный офис'}/>
          <InfoDisplay title={'ISKRA@mail.ru'} text={'Наша почта'}/>
        </div>
      </div>

      <div className={`${styles.mapContainer} mb-5`}>Map will be here</div>

    </div>
  );
};

export default Contacts;
