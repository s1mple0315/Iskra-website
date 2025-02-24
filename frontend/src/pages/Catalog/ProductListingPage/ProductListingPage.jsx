import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useProductStore from "../../../config/api/Store/useProductStore/UseProductStore";

import ProductCard from "../../../entities/components/ProductCard/ProductCard";
import styles from "./ProductListingPage.module.css";
import FilterUpperBlock from "../../../entities/components/Filters/FilterUpperBlock/FilterUpperBlock";

const ProductListingPage = () => {
  const { subcategoryId } = useParams();
  const { products, loading, error, fetchProducts, pagination } =
    useProductStore();
  const [currentPage, setCurrentPage] = useState(pagination.page); 

  useEffect(() => {
    if (subcategoryId) {
      fetchProducts(subcategoryId, currentPage, pagination.limit);
    }
  }, [subcategoryId, currentPage, pagination.limit, fetchProducts]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage); // 
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
      <FilterUpperBlock total={pagination.total_count}/>
      <div className={styles.productListing}>
        {products.length === 0 ? (
          <p>No products found</p>
        ) : (
          products.map((product, index) => (
            <ProductCard
              key={index}
              description={product.description}
              price={product.price}
            />
          ))
        )}
      </div>

      <div className="pagination">
        <p>
          Showing {pagination.limit} products per page. Total:{" "}
          {pagination.total_count} products.
        </p>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span> Page {currentPage} </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={
            currentPage === Math.ceil(pagination.total_count / pagination.limit)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductListingPage;
