import { useEffect } from "react";
import styles from "./CatalogPage.module.css";
import useProductStore from "../../../config/api/Store/useProductStore/UseProductStore";
import ParentCategory from "../../../entities/components/ParentCategory/ParentCategory";

const CatalogPage = () => {
  const { categories, fetchCategories, loading, error } = useProductStore();

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories, fetchCategories]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.catalogPage}>
      {categories.length > 0 ? (
          <ParentCategory />
      ) : (
        <div>No categories available</div>
      )}
    </div>
  );
};

export default CatalogPage;