import styles from "./Header.module.css";
import { Link } from "react-router-dom";

import MapPoint from "../../../shared/ui/icons/Layout/MapPoint/MapPoint";
import HeaderAppLogo from "../../../shared/ui/icons/Layout/Header/AppLogo/HeaderAppLogo";
import SearchBar from "../SearchBar/SearchBar";
import BurgerMenu from "../BurgerMenu/BurgerMenu";
import HeaderBasket from "../HeaderBasket/HeaderBasket";
import HeaderProfile from "../HeaderProfile/HeaderProfile";
import HeaderTelegram from "../../../shared/ui/icons/Layout/Header/Social/Telegram/HeaderTelegram";
import HeaderWhatsapp from "../../../shared/ui/icons/Layout/Header/Social/Whatsapp/HeaderWhatsapp";

const Header = () => {
  return (
    <div className={`${styles.header}  d-flex flex-column`}>
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

          <div className={`${styles.headerTopRight} d-flex align-items-center gap-5`}>
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
            className={`${styles.headerMiddleLeft} d-flex  align-items-center gap-3`}
          >
            <div>
              <HeaderAppLogo />
            </div>
            <div>
              <BurgerMenu />
            </div>
            <div className={styles.searchBarContainer}>
              <SearchBar />
            </div>
          </div>

          <div
            className={`${styles.headerMiddleRight} d-flex gap-3 align-items-center`}
          >
            <HeaderBasket />
            <HeaderProfile />
          </div>
        </div>
        <div className={`${styles.headerBottom}`}>
          <ul className="d-flex justify-content-between align-items-center gap-3">
            <li>
              <Link to={"/"} title="Apple">
                Apple
              </Link>
            </li>
            <li>
              <Link to={"/"} title="Смартфоны и гаджеты">
                Смартфоны и гаджеты
              </Link>
            </li>
            <li>
              <Link to={"/"} title="Для дома">
                Для дома
              </Link>
            </li>
            <li>
              <Link to={"/"} title="ТВ, аудио и видео">
                ТВ, аудио и видео
              </Link>
            </li>
            <li>
              <Link to={"/"} title="Компьютеры и ноутбуки">
                Компьютеры и ноутбуки
              </Link>
            </li>
            <li>
              <Link to={"/"} title="Аксессуары">
                Аксессуары
              </Link>
            </li>
            <li>
              <Link to={"/"} title="Sale">
                Sale
              </Link>
            </li>
          </ul>
        </div>
      </header>
    </div>
  );
};

export default Header;
