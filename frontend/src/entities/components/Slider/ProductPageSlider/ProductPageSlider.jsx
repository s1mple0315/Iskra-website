import React, { useState, useEffect, useMemo } from "react";
import styles from "./ProductPageSlider.module.css";

const ProductPageSlider = ({ product }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = useMemo(() => product?.images || [], [product?.images]);

  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images, currentIndex]);

  

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) =>
      (prevIndex - 1 + images.length) % images.length
    );
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className={styles.productPageSlider}>
      <div className={styles.thumbnailList}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image} 
            alt={`Thumbnail ${index + 1}`}
            className={
              index === currentIndex
                ? `${styles.thumbnail} ${styles.active}`
                : styles.thumbnail
            }
            onClick={() => handleThumbnailClick(index)}
          />
        ))}
      </div>

      <div className={styles.mainDisplay}>
        <button className={styles.prevButton} onClick={handlePrevClick}>
          ←
        </button>
        <img
          src={images[currentIndex]} 
          alt={`Image ${currentIndex + 1}`}
          className={styles.mainImage}
        />
        <button className={styles.nextButton} onClick={handleNextClick}>
          →
        </button>
      </div>
    </div>
  );
};

export default ProductPageSlider;