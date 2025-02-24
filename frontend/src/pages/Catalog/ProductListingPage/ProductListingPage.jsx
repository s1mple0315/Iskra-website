import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Use useNavigate here
import useProductStore from "../../../config/api/Store/useProductStore/UseProductStore";

import ProductCard from "../../../entities/components/ProductCard/ProductCard";
import styles from "./ProductListingPage.module.css";
import FilterUpperBlock from "../../../entities/components/Filters/FilterUpperBlock/FilterUpperBlock";
import Pagination from "../../../entities/components/Pagination/Pagination";

const ProductListingPage = () => {
  const { subcategoryId, parentId } = useParams();
  const { products, loading, error, fetchProducts, pagination, fetchProduct } = useProductStore();
  const [currentPage, setCurrentPage] = useState(pagination.page);

  const navigate = useNavigate(); 

  useEffect(() => {
    if (subcategoryId) {
      fetchProducts(subcategoryId, currentPage, pagination.limit);
    }
  }, [subcategoryId, currentPage, pagination.limit, fetchProducts]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleProductClick = (productId) => {
    console.log("Clicked Product ID:", productId);  // Log productId to confirm it's valid
    if (productId) {
      fetchProduct(productId); // Fetch the product details using the productId
      navigate(`/catalog/${parentId}/${subcategoryId}/${productId}`); // Navigate to the product detail page
    } else {
      console.error("Product ID is invalid");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="product-listing-page">
      <h2>Products</h2>
      <FilterUpperBlock total={pagination.total_count} />
      <div className={styles.productListing}>
        {products.length === 0 ? (
          <p>No products found</p>
        ) : (
          products.map((product, index) => (
            <ProductCard
              key={product._id} // Use _id as the key (unique identifier)
              description={product.description}
              price={product.price}
              productId={product._id} // Ensure _id is used
              parentId={parentId}
              subcategoryId={subcategoryId}
              onClick={() => handleProductClick(product._id)} // Pass the correct product ID to onClick
            />
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalCount={pagination.total_count}
        limit={pagination.limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProductListingPage;
