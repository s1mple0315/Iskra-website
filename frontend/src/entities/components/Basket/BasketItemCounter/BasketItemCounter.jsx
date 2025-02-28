import { useState } from "react";
import styles from "./BasketItemCounter.module.css";
import PropTypes from "prop-types"; 

const BasketItemCounter = ({
  initialValue = 1,
  minValue = 0,
  maxValue = 10,
  onChange,
}) => {
  const [count, setCount] = useState(initialValue);

  const handleDecrement = () => {
    if (count > minValue) {
      const newCount = count - 1;
      setCount(newCount);
      if (onChange) onChange(newCount);
    }
  };

  const handleIncrement = () => {
    if (count < maxValue) {
      const newCount = count + 1;
      setCount(newCount);
      if (onChange) onChange(newCount);
    }
  };

  return (
    <div className={styles.counterContainer}>
      <button
        className={styles.counterButton}
        onClick={handleDecrement}
        aria-label="Decrement"
      >
        -
      </button>
      <span className={styles.counterValue}>{count}</span>
      <button
        className={styles.counterButton}
        onClick={handleIncrement}
        aria-label="Increment"
      >
        +
      </button>
    </div>
  );
};

BasketItemCounter.propTypes = {
  initialValue: PropTypes.number,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  onChange: PropTypes.func,
};

BasketItemCounter.defaultProps = {
  initialValue: 1,
  minValue: 0,
  maxValue: 10,
  onChange: () => {},
};

export default BasketItemCounter;
