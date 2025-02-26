import styles from "./ProductDataDisplay.module.css";

const ProductDataDisplay = ({ product }) => {
  return (
    <div className={styles.productDataDisplay}>
      <div>
        <h3>{product?.brand || "Brand"}</h3> <span>#{product?._id || "ID"}</span>
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
          {/* Assuming 'memory' in product is a string or array of memory options; adjust based on your data */}
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
        <h3>{product?.price} $</h3>
        <button>Добавить в корзину</button>
      </div>
    </div>
  );
};

export default ProductDataDisplay;