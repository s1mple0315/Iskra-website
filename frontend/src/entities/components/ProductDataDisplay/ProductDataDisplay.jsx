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

  return (
    <div className={styles.productDataDisplay}>
      <div>
        <h3>{product?.brand || "Brand"}</h3>{" "}
        <span>#{product?._id || "ID"}</span>
      </div>
      <div>
        <h3>{product?.name || "Product Name"}</h3>
      </div>
      <div>
        <p>Цвет</p>
        <div>
          {product?.color ? (
            Array.isArray(product.color) ? (
              product.color.map((color, index) => (
                <div key={index}>{color}</div>
              ))
            ) : (
              <div>{product.color}</div>
            )
          ) : (
            <div>No color available</div>
          )}
        </div>
      </div>
      <div>
        <p>Память</p>
        <div>
          {product?.memory ? (
            Array.isArray(product.memory) ? (
              product.memory.map((memory, index) => (
                <div key={index}>{memory}</div>
              ))
            ) : (
              <div>{product.memory}</div>
            )
          ) : (
            <div>No memory available</div>
          )}
        </div>
      </div>
      <hr />
      <div className="d-flex justify-content-between">
        <h3>
          {product?.price
            ? `${product.price.toLocaleString("ru-RU")} ₽`
            : "Price unavailable"}
        </h3>
        <button onClick={handleAddToBasket} disabled={!product}>
          Добавить в корзину
        </button>
      </div>
    </div>
  );
};

export default ProductDataDisplay;
