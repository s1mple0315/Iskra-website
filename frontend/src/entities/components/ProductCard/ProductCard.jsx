import { Link } from "react-router-dom";
import AddCart from "../../../shared/ui/icons/product/addCart/AddCart";
import styles from "./ProductCard.module.css";
import useBasketStore from "../../../config/api/Store/useBasketStore/useBasketStore";

const ProductCard = ({
  description,
  price,
  parentId,
  subcategoryId,
  productId,
  onClick,
}) => {
  const { addItem } = useBasketStore();

  const handleAddToBasket = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const basketItem = {
      id: productId,
      name: description,
      price: price,
      images: ["/assets/Catalog/ProductImages/iPhone/iPhone.png"],
    };
    console.log(basketItem);
    
    addItem(basketItem);
  };

  return (
    <div
      className={`${styles.productCard} d-flex flex-column justify-content-between`}
      onClick={onClick}
    >
      <div className={styles.productImageSlider}>
        <img
          src="/assets/Catalog/ProductImages/iPhone/iPhone.png"
          alt={description}
        />
      </div>
      <Link to={`/catalog/${parentId}/${subcategoryId}/${productId}`}>
        <div className={styles.productInfo}>
          <p>{description}</p>
          <div className={styles.productInfoBottom}>
            <div className={styles.productPrice}>
              <p>{price.toLocaleString("ru-RU")} ₽</p>{" "}
            </div>
            <button
              className={styles.addCartButton}
              onClick={handleAddToBasket}
            >
              <AddCart />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
