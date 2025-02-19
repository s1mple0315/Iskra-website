import AddCart from "../../../shared/ui/icons/product/addCart/AddCart";
import styles from "./ProductCard.module.css";

const ProductCard = ({ description, price }) => {
  return (
    <div className={`${styles.productCard} d-flex flex-column`}>
      <div className={styles.productImageSlider}>
        <img src="/assets/Catalog/ProductImages/iPhone/iPhone.png" alt="" />
      </div>
      <div className={styles.productInfo}>
        <p>{description}</p>
        <div className={styles.productInfoBottom}>
          <div className={styles.productPrice}>
            <p>{price} $</p>
          </div>
          <button className={styles.addCartButton}>
            <AddCart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
