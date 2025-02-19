import { useEffect } from "react";

import styles from "./CatalogPage.module.css"
import useCategoryStore from "../../../config/api/Store/useCategoryStore/UseCategoryStore";
import ParentCategory from "../../../entities/components/ParentCategory/ParentCategory";

const CatalogPage = () => {
  const { parentCategories, fetchParentCategories } = useCategoryStore();

  useEffect(() => {
    if (parentCategories.length === 0) {
      fetchParentCategories();
    }
  }, [parentCategories, fetchParentCategories]);

  if (!parentCategories) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`${styles.catalogPage}`}>
      {parentCategories.length > 0 ? (
          <ParentCategory />
      ) : (
        <div>No categories available</div>
      )}
    </div>
  );
};

export default CatalogPage;
