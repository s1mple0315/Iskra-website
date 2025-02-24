import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useCategoryStore from "../../../config/api//Store/useCategoryStore/UseCategoryStore";

import styles from "./ParentCategoryPage.module.css";
import SubCategory from "../../../entities/components/SubCategory/SubCategory";

const ParentCategoryPage = () => {
  const { id } = useParams();
  const {
    childCategories,
    parentCategoryName,
    loading,
    error,
    fetchChildCategories,
  } = useCategoryStore();

  useEffect(() => {
    fetchChildCategories(id);
  }, [id, fetchChildCategories]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.parentCategoryPage}>
      <h2>{parentCategoryName}</h2>
      <div>
        <ul className={styles.subCategories}>
          {childCategories.map((subcategory) => (
            <SubCategory key={subcategory.id} name={subcategory.name} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ParentCategoryPage;
