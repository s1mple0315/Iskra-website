import { useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./ParentCategoryPage.module.css";
import useProductStore from "../../../config/api/Store/useProductStore/UseProductStore";
import SubCategory from "../../../entities/components/SubCategory/SubCategory";

const ParentCategoryPage = () => {
  const { parentId, subcategoryId } = useParams();
  const { categories, fetchCategories, loading, error } = useProductStore();

  useEffect(() => {
    if (categories.length === 0) { // Only fetch if categories are empty
      fetchCategories();
    }
  }, [categories.length, fetchCategories]); // Depend on categories.length

  const findCategory = () => {
    const parent = categories.find((cat) => cat.id === parentId);
    if (!parent) return null;
    if (!subcategoryId) return parent; 
    const sub = parent.subcategories.find((sub) => sub.id === subcategoryId);
    return sub || null;
  };

  const category = findCategory();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!category) return <div>Category not found</div>;

  return (
    <div className={styles.parentCategoryPage}>
      <h2>{category.name}</h2>
      <div>
        <ul className={styles.subCategories}>
          {category.subcategories.map((sub) => (
            <SubCategory
              key={sub.id}
              name={sub.name}
              id={sub.id}
              parentId={parentId}
              subcategoryId={subcategoryId || null}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ParentCategoryPage;