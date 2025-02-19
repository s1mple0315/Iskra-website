import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import styles from "./ParentCategoryPage.module.css";
import SubCategory from "../../../entities/components/SubCategory/SubCategory";

const ParentCategoryPage = () => {
  const { id } = useParams();
  const [parentCategory, setParentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParentCategory = async () => {
      setLoading(true);  
      try {
        const response = await axios.get(
          `http://localhost:8002/api/v1/products/categories/parents/${id}`
        );
        setParentCategory(response.data);
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setLoading(false);  
      }
    };

    fetchParentCategory();
  }, [id]);  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.parentCategoryPage}>
      <h2>{parentCategory.name}</h2>
      <div>
        <ul className={styles.subCategories}>
          {parentCategory.subcategories.map((subcategory) => (
            <SubCategory key={subcategory.id} name={subcategory.name}/>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ParentCategoryPage;
