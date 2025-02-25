import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useProductStore from "../../../config/api/Store/useProductStore/UseProductStore";
import ProductPageSlider from "../../../entities/components/Slider/ProductPageSlider/ProductPageSlider";

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const { product, loading, error, fetchProduct } = useProductStore();

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId, fetchProduct]);
  console.log(product);
  
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="product-detail-page">
      <h2>{product?.name || "Product Name"}</h2>
      <p>{product?.description || "No description available."}</p>
      <p>
        <strong>Price: </strong>
        {product?.price ? `$${product.price}` : "N/A"}
      </p>
      <p>
        <strong>Stock: </strong>
        {product?.stock || "Out of stock"}
      </p>

      <ProductPageSlider product={product} />

      {product?.images && product.images.length > 0 && (
        <ProductPageSlider product={product} />
      )}
    </div>
  );
};

export default ProductDetailsPage;
