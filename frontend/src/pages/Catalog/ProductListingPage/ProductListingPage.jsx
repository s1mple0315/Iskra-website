import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Removed useNavigate
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
  const { filters, setFilter } = useFilterStore();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (subSubcategoryId) {
      fetchProducts(subSubcategoryId, filters.page, filters.limit);
    }
  }, [subSubcategoryId, filters.page, filters.limit, fetchProducts]);

  const handlePageChange = (newPage) => {
    setFilter("page", newPage);
  };

  console.log({ parentId, subcategoryId, subSubcategoryId, products });

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
                description={product.name}
                price={product.price}
                productId={product._id}
                parentId={parentId}
                subcategoryId={subcategoryId}
                subSubcategoryId={subSubcategoryId}
              />
            ))
          )}
        </div>
      </div>
      <Pagination
        currentPage={filters.page}
        totalCount={pagination.total_count}
        limit={filters.limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProductListingPage;