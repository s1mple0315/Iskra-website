import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./BurgerMenu.module.css";
import Burger from "../../../shared/ui/icons/Layout/Header/Burger/Burger";
import useProductStore from "../../../config/api/Store/useProductStore/UseProductStore";

const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const { categories, fetchCategories, loading, error } = useProductStore();

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    setSelectedParentId(null);
  };

  const previewImage = "/assets/iphone-preview.png";
  const selectedParent = categories.find((cat) => cat.id === selectedParentId);

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
          <div className={styles.dropdownContent}>
            {/* First Column: Parent Categories */}
            <ul className={styles.parentCategoryList}>
              {loading ? (
                <li>Loading...</li>
              ) : error ? (
                <li>{error}</li>
              ) : categories.length === 0 ? (
                <li>No categories available</li>
              ) : (
                categories.map((parent) => (
                  <li
                    key={parent.id}
                    className={styles.parentCategoryItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedParentId(parent.id);
                    }}
                  >
                    <span>{parent.name}</span>
                  </li>
                ))
              )}
            </ul>

            {/* Second Column: Subcategories and Sub-subcategories */}
            {selectedParent && (
              <div className={`${styles.subcategoryContainer} ${styles.visible}`}>
                {selectedParent.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className={styles.subcategoryColumn}>
                    <span
                      className={styles.subcategoryTitle}
                      style={{ color: "red" }} // Temporary debug color
                    >
                      {subcategory.name}
                    </span>
                    <ul className={styles.subSubcategoryList}>
                      {subcategory.subcategories.map((subSubcategory) => (
                        <li key={subSubcategory.id} className={styles.subSubcategoryItem}>
                          <Link
                            to={`/catalog/${selectedParent.id}/${subcategory.id}/${subSubcategory.id}`}
                            onClick={closeMenu}
                            style={{ color: "blue" }} // Temporary debug color
                          >
                            {subSubcategory.name} (Debug)
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/catalog/${selectedParent.id}/${subcategory.id}`}
                      onClick={closeMenu}
                      className={styles.seeAllLink}
                      style={{ color: "green" }} // Temporary debug color
                    >
                      Все товары (Debug)
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BurgerMenu;