import { useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./ProductDetailsPage.module.css";
import useProductStore from "../../../config/api/Store/useProductStore/UseProductStore";
import ProductPageSlider from "../../../entities/components/Slider/ProductPageSlider/ProductPageSlider";
import ProductDataDisplay from "../../../entities/components/ProductDataDisplay/ProductDataDisplay";

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const { product, loading, error, fetchProduct } = useProductStore();

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId, fetchProduct]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.productDetailsPage}>
      <div className={styles.productDetailsContainer}>
        <div className={`${styles.productDetailsContent} container d-flex justify-content-between`}>
          {product?.images && product.images.length > 0 && (
            <ProductPageSlider product={product} />
          )}
          <ProductDataDisplay product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;