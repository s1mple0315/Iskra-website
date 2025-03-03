import styles from "./ParentCategory.module.css";
import useCategoryStore from "../../../config/api/Store/useCategoryStore/UseCategoryStore";
import { useEffect } from "react";

const ParentCategory = () => {
  const { parentCategories, fetchParentCategories } = useCategoryStore();

  useEffect(() => {
    fetchParentCategories();
  }, [fetchParentCategories]);

  return (
    <>
      {parentCategories.map((parent) => (
        <div key={parent.id} className={`${styles.parentCategory} d-flex flex-column`}>
          <div>
            <h3>{parent.name}</h3>
          </div>
          <div className="d-flex position-relative">
            <div className={`${styles.childCategories} d-flex flex-column`}>
              <ul>
                {parent.subcategories.map((child) => (
                  <li key={child.id}>{child.name}</li>
                ))}
              </ul>
            </div>
            <div className={`${styles.parentCategoryImage} position-absolute`}>
              <img src="assets/Catalog/ParentCategory/CatalogParent.png" alt="Category Image" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ParentCategory;
