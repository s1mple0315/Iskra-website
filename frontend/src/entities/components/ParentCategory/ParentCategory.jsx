import styles from "./ParentCategory.module.css";

const ParentCategory = () => {
  return (
    <div className={`${styles.parentCategory} d-flex flex-column `}>
      <div>
        <h3>Apple</h3>
      </div>
      <div className="d-flex position-relative">
        <div className={`${styles.childCategories} d-flex flex-column`}>
          <ul>
            <li>Mac</li>
            <li>iPhone</li>
            <li>Watch</li>
            <li>iPad</li>
            <li>AirPods</li>
          </ul>
        </div>
        <div className={`${styles.parentCategoryImage} position-absolute`}>
          <img src="assets/Catalog/ParentCategory/CatalogParent.png" alt="Category Image" />
        </div>
      </div>
    </div>
  );
};

export default ParentCategory;
