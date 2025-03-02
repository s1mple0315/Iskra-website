import ChevronDown from "../../../../shared/ui/icons/Chevron/ChevronDown/ChevronDown";
import FilterOpen from "../../../../shared/ui/icons/Filters/FilterOpen/FilterOpen";
import styles from "./FilterUpperBlock.module.css";

const FilterUpperBlock = ({ total, onFilterToggle }) => {
  return (
    <div
      className={`${styles.filterUpperBlock} d-flex align-items-center justify-content-between`}
    >
      <div
        className={`${styles.filterAction} d-flex align-items-center`}
        onClick={onFilterToggle} 
      >
        <FilterOpen />
        <span>Фильтры</span>
      </div>
      <div className={`${styles.filterInfo} d-flex align-items-center`}>
        <div
          className={`${styles.filterTotalProducts} d-flex align-items-center`}
        >
          <p>{total} товаров</p>
        </div>
        <div className={`${styles.filterSort} d-flex align-items-center`}>
          <p>Популярные</p>
          <ChevronDown />
        </div>
      </div>
    </div>
  );
};

export default FilterUpperBlock;