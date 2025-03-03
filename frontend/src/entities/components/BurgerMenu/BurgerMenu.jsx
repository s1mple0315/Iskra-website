import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./BurgerMenu.module.css";
import Burger from "../../../shared/ui/icons/Layout/Header/Burger/Burger";

const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = (e) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  // Static data for dropdown (to be replaced with dynamic data later)
  const staticCategories = [
    {
      name: "Apple",
      subcategories: [
        {
          name: "Mac",
          items: ["MacBook Air", "MacBook Pro", "Mac Mini", "iMac", "Аксессуары"],
          seeAllLink: "/catalog/apple-mac",
        },
        {
          name: "iPhone",
          items: ["iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16", "iPhone 15 Pro Max"],
          seeAllLink: "/catalog/apple-iphone",
        },
        {
          name: "Watch",
          items: ["MacBook Air", "MacBook Pro", "Mac Mini", "iMac", "Аксессуары"],
          seeAllLink: "/catalog/apple-watch",
        },
        {
          name: "iPad",
          items: ["iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16", "iPhone 15 Pro Max"],
          seeAllLink: "/catalog/apple-ipad",
        },
      ],
    },
  ];

  // Static preview image URL (replace with a real path later)
  const previewImage = "/assets/iphone-preview.png"; // Placeholder image

  return (
    <div className={styles.burgerMenuContainer} onClick={toggleMenu}>
      <div className={styles.burgerMenu}>
        <Burger />
        <h3>Каталог товаров</h3>
      </div>
      {isOpen && (
        <div className={styles.catalogDropdown} onClick={closeMenu}>
          <button className={styles.closeButton} onClick={closeMenu}>
            ×
          </button>
          <div
            className={styles.dropdownBackground}
            style={{ backgroundImage: `url(${previewImage})` }}
          ></div>
          <ul className={styles.dropdownList}>
            {staticCategories.map((category) => (
              <li key={category.name} className={styles.dropdownItem}>
                <span>{category.name}</span>
                <ul className={styles.subcategoryList}>
                  {category.subcategories.map((subcategory) => (
                    <li key={subcategory.name} className={styles.subcategoryItem}>
                      <span>{subcategory.name}</span>
                      <ul className={styles.nestedItemList}>
                        {subcategory.items.map((item) => (
                          <li key={item} className={styles.nestedItem}>
                            <Link to="#" onClick={closeMenu}>
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link to={subcategory.seeAllLink} onClick={closeMenu}>
                        Все товары
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BurgerMenu;