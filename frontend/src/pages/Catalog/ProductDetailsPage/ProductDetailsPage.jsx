import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useProductStore from "../../../config/api/Store/useProductStore/UseProductStore";
import ProductPageSlider from "../../../entities/components/Slider/ProductPageSlider/ProductPageSlider";
import ProductDataDisplay from "../../../entities/components/ProductDataDisplay/ProductDataDisplay";

import styles from "./ProductDetailsPage.module.css"

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
    <div className="product-details-page">
      <div className={styles.productDetailsContainer}>
        <div className="container">
          <div className="row justify-content-between">
            {product?.images && product.images.length > 0 && (
              <div className={`${styles.imageSliderContainer} col-12 col-md-5`}>
                <ProductPageSlider product={product} />
              </div>
            )}
            <div className="col-12 col-md-6">
              <ProductDataDisplay product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;