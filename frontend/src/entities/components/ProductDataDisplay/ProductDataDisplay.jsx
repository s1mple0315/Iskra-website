import styles from "./ProductDataDisplay.module.css";

const ProductDataDisplay = () => {
  return (
    <div className={styles.productDataDisplay}>
      <div>
        <h3>Apple</h3> <span>#1648128</span>
      </div>
      <div>
        <h3>Смартфон Apple iPhone 16 Plus 128 ГБ (Чёрный | Black)</h3>
      </div>
      <div>
        <p>Цвет</p>
        <div>
          <div>grey</div>
          <div>black</div>
          <div>gold</div>
        </div>
      </div>
      <div>
        <p>Память</p>
        <div>
          <div>64GB</div>
          <div>128GB</div>
          <div>256GB</div>
        </div>
      </div>
      <hr />
      <div>
        <h3>price</h3>
        <button>Добавить в корзину</button>
      </div>
    </div>
  );
};

export default ProductDataDisplay;
