import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useProductStore from "../../../config/api/Store/useProductStore/UseProductStore";
import ProductCard from "../../../entities/components/ProductCard/ProductCard";
import styles from "./ProductListingPage.module.css";
import FilterUpperBlock from "../../../entities/components/Filters/FilterUpperBlock/FilterUpperBlock";
import Pagination from "../../../entities/components/Pagination/Pagination";
import FiltersLeftBlock from "../../../entities/components/Filters/FiltersLeftBlock/FiltersLeftBlock"; // Import FiltersLeftBlock
import useFilterStore from "../../../config/api/Store/useFilterStore/useFilterStore"; // Adjust path

const ProductListingPage = () => {
  const { subcategoryId, parentId } = useParams();
  const { products, loading, error, fetchProducts, pagination } = useProductStore();
  const [currentPage, setCurrentPage] = useState(pagination.page);
  const [showFilters, setShowFilters] = useState(false); // State to toggle filters
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
    console.log("Clicked Product ID:", productId);
    if (productId) {
      // Assuming fetchProduct and navigate are part of useProductStore
      fetchProduct(productId);
      navigate(`/catalog/${parentId}/${subcategoryId}/${productId}`);
    } else {
      console.error("Product ID is invalid");
    }
  };

  // Fetch filtered products when filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      const { getFilterQuery } = useFilterStore();
      const query = getFilterQuery();
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/filter?${query}&subcategory_id=${subcategoryId}`
        );
        if (!response.ok) throw new Error("Failed to fetch filtered products");
        const data = await response.json();
        // Update useProductStore products (if possible) or handle locally
        // For now, assuming fetchProducts updates the store
        fetchProducts(subcategoryId, currentPage, pagination.limit); // Refresh with filters
      } catch (err) {
        console.error(err.message);
      }
    };
    if (subcategoryId) fetchFilteredProducts();
  }, [useFilterStore, subcategoryId, currentPage, pagination.limit]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="product-listing-page">
      <h2>Products</h2>
      <FilterUpperBlock
        total={pagination.total_count}
        onFilterToggle={() => setShowFilters(!showFilters)} // Toggle filter visibility
      />
      <div className={styles.filterLayout}>
        {showFilters && (
          <div className={styles.filtersSidebar}>
            <FiltersLeftBlock products={products} />
          </div>
        )}
        <div className={styles.productListing}>
          {products.length === 0 ? (
            <p>No products found</p>
          ) : (
            products.map((product, index) => (
              <ProductCard
                key={product._id}
                description={product.description}
                price={product.price}
                productId={product._id}
                parentId={parentId}
                subcategoryId={subcategoryId}
                onClick={() => handleProductClick(product._id)}
              />
            ))
          )}
        </div>
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