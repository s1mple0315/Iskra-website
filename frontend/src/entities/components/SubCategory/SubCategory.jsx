import styles from "./SubCategory.module.css";

const SubCategory = ({ name }) => {
  return (
    <div className={styles.subCategory}>
      <h3>{name}</h3>
      <img src="assets/Catalog/SubCategory/mac.png" alt="Subcategory Image" />
    </div>
  );
};

export default SubCategory;
