import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCategoryStore from "../../../config/api/Store/useCategoryStore/UseCategoryStore";
import styles from "./Header.module.css";
import MapPoint from "../../../shared/ui/icons/Layout/MapPoint/MapPoint";
import HeaderAppLogo from "../../../shared/ui/icons/Layout/Header/AppLogo/HeaderAppLogo";
import SearchBar from "../SearchBar/SearchBar";
import BurgerMenu from "../BurgerMenu/BurgerMenu";
import HeaderBasket from "../HeaderBasket/HeaderBasket";
import HeaderProfile from "../HeaderProfile/HeaderProfile";
import HeaderTelegram from "../../../shared/ui/icons/Layout/Header/Social/Telegram/HeaderTelegram";
import HeaderWhatsapp from "../../../shared/ui/icons/Layout/Header/Social/Whatsapp/HeaderWhatsapp";

const Header = () => {
  const { parentCategories, loading, error, fetchParentCategories } =
    useCategoryStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchParentCategories();
  }, [fetchParentCategories]);

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleSearchResults = (results) => {
    if (results.length > 0) {
      const product = results[0];
      navigate(`/catalog/${product.category_id}/${product._id}`);
    } else {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className={`${styles.header} d-flex flex-column`}>
      <header className="container">
        <div
          className={`${styles.headerTop} d-flex align-items-center justify-content-between`}
        >
          <div className="d-flex justify-content-between">
            <div
              className={`${styles.appLogo} d-flex align-items-center gap-2`}
            >
              <MapPoint />
              <p>Москва</p>
            </div>
            <div className={`${styles.headerTopLinks}`}>
              <ul className="d-flex">
                <li>
                  <Link to={"/company"} title="О компании">
                    О компании
                  </Link>
                </li>
                <li>
                  <Link to={"/guarantee"} title="Гарантия">
                    Гарантия
                  </Link>
                </li>
                <li>
                  <Link to={"/delivery"} title="Доставка">
                    Доставка
                  </Link>
                </li>
                <li>
                  <Link to={"/contacts"} title="Контакты">
                    Контакты
                  </Link>
                </li>
                <li>
                  <Link to={"/regular"} title="Постоянным клиентам">
                    Постоянным клиентам
                  </Link>
                </li>
                <li>
                  <Link to={"/blog"} title="Блог">
                    Блог
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div
            className={`${styles.headerTopRight} d-flex align-items-center gap-5`}
          >
            <div className="d-flex gap-2">
              <HeaderTelegram />
              <HeaderWhatsapp />
            </div>
            <p>8 800 758 00 00</p>
          </div>
        </div>
        <div
          className={`${styles.headerMiddle} d-flex justify-content-between`}
        >
          <div
            className={`${styles.headerMiddleLeft} d-flex align-items-center gap-3`}
          >
            <div className={styles.headerAppLogo}>
              <HeaderAppLogo />
            </div>
            <div className={styles.burgerMenuContainer}>
              <BurgerMenu />
            </div>
            <div className={styles.searchBarContainer}>
              <SearchBar onSearchResults={handleSearchResults} />
            </div>
          </div>
          <div
            className={`${styles.headerMiddleRight} d-flex gap-3 align-items-center`}
          >
            <Link to={"/basket"}>
              <HeaderBasket />
            </Link>
            <HeaderProfile />
          </div>
        </div>
        <div className={`${styles.headerBottom}`}>
          <ul className="d-flex justify-content-between align-items-center">
            {parentCategories.length > 0 ? (
              parentCategories.map((category) => (
                <li key={category.id}>
                  <Link to={`/catalog/${category.id}`} title={category.name}>
                    {category.name}
                  </Link>
                </li>
              ))
            ) : (
              <li>No categories available</li>
            )}
          </ul>
        </div>
      </header>
    </div>
  );
};

export default Header;