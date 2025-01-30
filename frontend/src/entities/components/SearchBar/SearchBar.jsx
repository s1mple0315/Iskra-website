import styles from "./SearchBar.module.css";

import Search from "../../../shared/ui/icons/Layout/Header/Search/Search"

const SearchBar = () => {
  return (
    <div
      className={`${styles.searchBarContainer} d-flex justify-content-between align-items-center`}
    >
      <input type="text" placeholder="Поиск товаров"/>
      <Search />
    </div>
  );
};

export default SearchBar;
