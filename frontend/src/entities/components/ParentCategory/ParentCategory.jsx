import styles from "./ParentCategory.module.css";
import useCategoryStore from "../../../config/api/Store/useCategoryStore/UseCategoryStore";
import { useEffect } from "react";
import { Link } from "react-router-dom"; // Added for navigation

const ParentCategory = () => {
  const { parentCategories, fetchParentCategories } = useCategoryStore();

  useEffect(() => {
    fetchParentCategories();
  }, [fetchParentCategories]);

  return (
    <>
      {parentCategories.length > 0 ? (
        parentCategories.map((parent) => (
          <div key={parent.id} className={`${styles.parentCategory} d-flex flex-column`}>
            <div className={styles.parentCategoryTitle}>
              <Link to={`/catalog/${parent.id}`}>
                <h3>{parent.name}</h3>
              </Link>
            </div>
            <div className="d-flex position-relative">
              <div className={`${styles.childCategories} d-flex flex-column`}>
                <ul>
                  {parent.subcategories && parent.subcategories.length > 0 ? (
                    parent.subcategories.map((child) => (
                      <li key={child.id}>
                        <Link to={`/catalog/${parent.id}/${child.id}`}>
                          {child.name || "Unnamed Subcategory"}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li>No subcategories available</li>
                  )}
                </ul>
              </div>
              <div className={`${styles.parentCategoryImage} position-absolute`}>
                <img src="/assets/Catalog/ParentCategory/CatalogParent.png" alt="Category Image" />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div>No parent categories available</div>
      )}
    </>
  );
};

export default ParentCategory;