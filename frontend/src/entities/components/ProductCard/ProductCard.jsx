import { Link } from "react-router-dom";


import AddCart from "../../../shared/ui/icons/product/addCart/AddCart";
import styles from "./ProductCard.module.css";

const ProductCard = ({ description, price, parentId, subcategoryId, productId, onClick }) => {
  console.log(productId)

  return (
    <div
      className={`${styles.productCard} d-flex flex-column justify-content-between`}
      onClick={onClick}
    >
      <div className={styles.productImageSlider}>
        <img src="/assets/Catalog/ProductImages/iPhone/iPhone.png" alt="" />
      </div>
      <Link to={`/catalog/${parentId}/${subcategoryId}/${productId}`}>
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
      </Link>
    </div>
  );
};

export default ProductCard;
