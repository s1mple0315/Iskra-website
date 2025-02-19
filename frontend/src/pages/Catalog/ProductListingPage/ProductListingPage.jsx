import { useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import ProductCard from "../../../entities/components/ProductCard/ProductCard";
import styles from "./ProductListingPage.module.css"

const ProductListingPage = () => {
  const { subcategoryId } = useParams(); // Get subcategoryId from URL params
  const [products, setProducts] = useState([]); // State to store products
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    total_count: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      if (!subcategoryId) {
        setError("Invalid subcategory ID");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8002/api/v1/products/categories/${subcategoryId}/products`
        );
        setProducts(response.data.products); // Set the products
        setPagination({
          limit: response.data.limit,
          page: response.data.page,
          total_count: response.data.total_count,
        });
      } catch (err) {
        setError("Failed to fetch products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [subcategoryId]); // Re-run the effect if subcategoryId changes

  // Handle loading, error, or display products
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="product-listing-page">
      <h2>Products</h2>
      <div className={styles.productListing}>
        {products.length === 0 ? (
          <p>No products found</p>
        ) : (
          products.map((product, index) => (
            <ProductCard key={index} description={product.description} price={product.price}/>
          ))
        )}
      </div>

      <div className="pagination">
        <p>
          Showing {pagination.limit} products per page. Total:{" "}
          {pagination.total_count} products.
        </p>
        <button
          onClick={() => {
            if (pagination.page > 1) {
              setPagination((prev) => ({
                ...prev,
                page: prev.page - 1,
              }));
            }
          }}
          disabled={pagination.page === 1}
        >
          Previous
        </button>
        <span> Page {pagination.page} </span>
        <button
          onClick={() => {
            if (pagination.page < Math.ceil(pagination.total_count / pagination.limit)) {
              setPagination((prev) => ({
                ...prev,
                page: prev.page + 1,
              }));
            }
          }}
          disabled={pagination.page === Math.ceil(pagination.total_count / pagination.limit)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductListingPage;
