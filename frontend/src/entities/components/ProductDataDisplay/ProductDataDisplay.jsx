import styles from "./ProductDataDisplay.module.css";
import useBasketStore from "../../../config/api/Store/useBasketStore/useBasketStore";

const ProductDataDisplay = ({ product }) => {
  const { addItem } = useBasketStore();

  const handleAddToBasket = () => {
    if (!product) {
      console.error("No product data available to add to basket");
      return;
    }

    const basketItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      images: product.images || [],
    };

    addItem(basketItem);
  };

  // Mock color swatches (replace with actual logic if backend provides color hex codes)
  const colorSwatches = product?.color
    ? Array.isArray(product.color)
      ? product.color
      : [product.color]
    : ["#fff", "#000", "#f5a623"]; // Default swatches if no data

  return (
    <div className={styles.productDataDisplay}>
      <div className={styles.productHeader}>
        <h3 className={styles.brand}>{product?.brand || "Brand"}</h3>
        <span className={styles.productId}>#{product?._id || "ID"}</span>
      </div>
      <h1 className={styles.productName}>{product?.name || "Product Name"}</h1>
      <div className={styles.optionSection}>
        <p className={styles.optionLabel}>Цвет</p>
        <div className={styles.colorOptions}>
          {colorSwatches.map((color, index) => (
            <div
              key={index}
              className={styles.colorSwatch}
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>
      </div>
      <div className={styles.optionSection}>
        <p className={styles.optionLabel}>Память</p>
        <div className={styles.memoryOptions}>
          {product?.memory && Array.isArray(product.memory) ? (
            product.memory.map((memory, index) => (
              <button key={index} className={styles.memoryButton}>
                {memory}
              </button>
            ))
          ) : (
            <button className={styles.memoryButton}>No memory available</button>
          )}
        </div>
      </div>
      <hr className={styles.divider} />
      <div className={styles.priceAction}>
        <h2 className={styles.price}>
          {product?.price
            ? `${product.price.toLocaleString("ru-RU")} ₽`
            : "Price unavailable"}
        </h2>
        <button
          className={styles.addToCart}
          onClick={handleAddToBasket}
          disabled={!product}
        >
          Добавить в корзину
        </button>
      </div>
    </div>
  );
};

export default ProductDataDisplay;