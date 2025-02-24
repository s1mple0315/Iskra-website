import { useEffect } from "react";
import { Link } from "react-router-dom";
import useCategoryStore from "../../../config/api/Store/useCategoryStore/UseCategoryStore";

import styles from "./Footer.module.css";
import AppLogo from "../../../shared/ui/icons/Layout/Logo/AppLogo";
import MapPoint from "../../../shared/ui/icons/Layout/MapPoint/MapPoint";
import Whatsup from "../../../shared/ui/icons/Layout/Social/Whatsup/Whatsup";
import Telegram from "../../../shared/ui/icons/Layout/Social/Telegram/Telegram";
import Mir from "../../../shared/ui/icons/Layout/Payment/Mir/Mir";
import Visa from "../../../shared/ui/icons/Layout/Payment/Visa/Visa";
import Sbp from "../../../shared/ui/icons/Layout/Payment/Sbp/Sbp";

const Footer = () => {
  const { parentCategories, loading, error, fetchParentCategories } =
    useCategoryStore();

  useEffect(() => {
    fetchParentCategories();
  }, [fetchParentCategories]);

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div
      className={`${styles.footer} d-flex flex-column justify-content-between`}
    >
      <div className="container">
        <div className={`${styles.footerTop} d-flex justify-content-between`}>
          <div className={`${styles.appLogo} d-flex flex-column gap-3`}>
            <AppLogo />
            <div className="d-flex align-items-center gap-2">
              <MapPoint />
              <p>Москва</p>
            </div>
          </div>
          <div>
            <h3>Карта Сайта</h3>
            <ul>
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
          <div>
            <h3>Помощь</h3>
            <ul>
              <li>
                <Link to={"/"} title="Где мой заказ?">
                  Где мой заказ?
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
            </ul>
          </div>
          <div>
            <h3>Каталог</h3>
            <ul>
              {parentCategories.length > 0 ? (
                parentCategories.map((category) => (
                  <li key={category._id}>
                    <Link to={`/catalog/${category._id}`} title={category.name}>
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>Нет категорий</li>
              )}
            </ul>
          </div>
          <div>
            <h3>8 800 758 00 00</h3>
            <div className="d-flex gap-3">
              <Whatsup />
              <Telegram />
            </div>
            <div>
              <Mir />
              <Visa />
              <Sbp />
            </div>
          </div>
        </div>
        <div
          className={`${styles.footerBottom} d-flex justify-content-between align-items-center`}
        >
          <div className={`${styles.footerBottomLeft}`}>
            <p>Авторские права ©2024 ignis. Все права защищены.</p>
          </div>
          <div className={`${styles.footerBottomCenter}`}>
            <p>Политика конфиденциальности</p>
          </div>
          <div className={`${styles.footerBottomRight}`}>
            <p>
              Сайт носит сугубо информационный характер и не является публичной
              офертой, определяемой Статьей 437 (2) ГК РФ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
