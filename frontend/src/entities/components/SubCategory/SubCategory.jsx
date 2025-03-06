import { Link } from "react-router-dom";
import styles from "./SubCategory.module.css";

const SubCategory = ({ name, id, parentId, subcategoryId }) => {
  // Build URL based on hierarchy level
  const url = subcategoryId
    ? `/catalog/${parentId}/${subcategoryId}/${id}` // Sub-subcategory level
    : `/catalog/${parentId}/${id}`; // Subcategory level

  return (
    <div className={styles.subCategory}>
      <Link to={url}>
        <h3>{name}</h3>
        <img src="/assets/Catalog/SubCategory/mac.png" alt="Subcategory Image" />
      </Link>
    </div>
  );
};

export default SubCategory;