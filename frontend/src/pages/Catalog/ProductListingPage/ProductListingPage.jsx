import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useProductStore from "../../../config/api/Store/useProductStore/UseProductStore";
import ProductCard from "../../../entities/components/ProductCard/ProductCard";
import styles from "./ProductListingPage.module.css";
import FilterUpperBlock from "../../../entities/components/Filters/FilterUpperBlock/FilterUpperBlock";
import Pagination from "../../../entities/components/Pagination/Pagination";
import FiltersLeftBlock from "../../../entities/components/Filters/FiltersLeftBlock/FiltersLeftBlock";
import useFilterStore from "../../../config/api/Store/useFilterStore/useFilterStore";

const ProductListingPage = () => {
  const { parentId, subcategoryId, subSubcategoryId } = useParams();
  const { products, loading, error, fetchProducts, pagination } = useProductStore();
  const [currentPage, setCurrentPage] = useState(pagination.page);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (subSubcategoryId) {
      fetchProducts(subSubcategoryId, currentPage, pagination.limit);
    }
  }, [subSubcategoryId, currentPage, pagination.limit, fetchProducts]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleProductClick = (productId) => {
    console.log("Clicked Product ID:", productId);
    if (productId) {
      navigate(`/catalog/${parentId}/${subcategoryId}/${subSubcategoryId}/${productId}`);
    } else {
      console.error("Product ID is invalid");
    }
  };

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      const { getFilterQuery } = useFilterStore();
      const query = getFilterQuery();
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/products/filter?${query}`
        );
        if (!response.ok) throw new Error("Failed to fetch filtered products");
        const data = await response.json();
        // Assuming filter endpoint returns filtered products for the subcategory
        fetchProducts(subSubcategoryId, currentPage, pagination.limit);
      } catch (err) {
        console.error(err.message);
      }
    };
    if (subSubcategoryId) fetchFilteredProducts();
  }, [subSubcategoryId, currentPage, pagination.limit]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="product-listing-page">
      <h2>Products</h2>
      <FilterUpperBlock
        total={pagination.total_count}
        onFilterToggle={() => setShowFilters(!showFilters)}
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
            products.map((product) => (
              <ProductCard
                key={product.id}
                description={product.name} // Changed to name for consistency
                price={product.price}
                productId={product.id}
                parentId={parentId}
                subcategoryId={subcategoryId}
                onClick={() => handleProductClick(product.id)}
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