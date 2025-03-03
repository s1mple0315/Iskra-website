import { Link } from "react-router-dom";
import styles from "./SubCategory.module.css";

const SubCategory = ({ name, id, parentId }) => {
  return (
    <div className={styles.subCategory}>
      <Link to={`/catalog/${parentId}/${id}`}>
        <h3>{name}</h3>
        <img
          src="/assets/Catalog/SubCategory/mac.png"
          alt="Subcategory Image"
        />
      </Link>
    </div>
  );
};

export default SubCategory;
