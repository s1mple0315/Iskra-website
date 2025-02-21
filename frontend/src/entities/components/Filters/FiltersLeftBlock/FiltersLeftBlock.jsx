import Accordion from "../../Accordion/Accordion";
import styles from "./FiltersLeftBlock.module.css";

const FiltersLeftBlock = () => {
  return (
    <div className={styles.filtersLeftBlock}>
      <Accordion title={"Бренд"} />
      <Accordion title={"Цена"} />
      <Accordion title={"Серия"} />
      <Accordion title={"Память"} />
      <Accordion title={"SIM карта"} />
      <Accordion title={"Тип процессора"} />
      <Accordion title={"Цвет"} />
    </div>
  );
};

export default FiltersLeftBlock;
