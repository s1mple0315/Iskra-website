import { useEffect, useState } from "react";
import styles from "./MainPage.module.css";
import ParentCategory from "../../entities/components/ParentCategory/ParentCategory";
import BrandLogos from "../../entities/components/BrandLogos/BrandLogos";
import useProductStore from "../../config/api/Store/useProductStore/useProductStore";
import ProductCard from "../../entities/components/ProductCard/ProductCard";
import { getAllBlogs } from "../../config/api/Blogs/BlogsAPI";
import BlogCard from "../../entities/components/BlogCard/BlogCard"

const MainPage = () => {
  const [blogs, setBlogs] = useState([]);
  const { products, fetchProducts, fetchCategories } = useProductStore();

  // Fetch categories and products for Featured and New sections
  useEffect(() => {
    // Fetch categories (optional, for consistency with store)
    fetchCategories();

    // Fetch products for Featured Products (iPhone 14)
    fetchProducts("67c8d739fd0026bd0691207c");

    // Fetch products for New Products (Blender)
    fetchProducts("67c8d73afd0026bd069120b8");
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getAllBlogs();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch Blogs Error:", err);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className={styles.mainPage}>
      {/* <section className={styles.bannerSection}>Banner</section> */}
      <section className={styles.catalogSection}>
        <ParentCategory />
      </section>
      <section className={styles.brandLogosSection}>
        <BrandLogos />
      </section>
      <section className={styles.featuredProductsSection}>
        <h2 className={styles.sectionTitle}>Featured Products</h2>
        <div className={styles.productGrid}>
          {products.length > 0 ? (
            products.slice(0, 4).map((product) => (
              <ProductCard
                key={product._id}
                description={product.name}
                price={product.price}
                parentId={product.parentId || ""}
                subcategoryId={product.subcategoryId || ""}
                subSubcategoryId={
                  product.subSubcategoryId || "67c8d739fd0026bd0691207c"
                } // Default to Featured ID
                productId={product._id}
                onClick={() => console.log(`Clicked product ${product._id}`)} // Placeholder
              />
            ))
          ) : (
            <p>No featured products available.</p>
          )}
        </div>
      </section>
      <section className={styles.newProductsSection}>
        <div className="d-flex justify-content-between mb-3">
          <h2 className={styles.sectionTitle}>New Products</h2>
          <button className={styles.newSectionButton}>
            Смотреть все новинки
          </button>
        </div>
        <div className={styles.productGrid}>
          {products.length > 0 ? (
            products.slice(0, 4).map((product) => (
              <ProductCard
                key={product._id}
                description={product.name}
                price={product.price}
                parentId={product.parentId || ""}
                subcategoryId={product.subcategoryId || ""}
                subSubcategoryId={
                  product.subSubcategoryId || "67c8d73afd0026bd069120b8"
                } // Default to New ID
                productId={product._id}
                onClick={() => console.log(`Clicked product ${product._id}`)} // Placeholder
              />
            ))
          ) : (
            <p>No new products available.</p>
          )}
        </div>
      </section>
      <section className={styles.blogSection}>
        <h2 className={styles.sectionTitle}>Blog</h2>
        <div className={styles.productGrid}>
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <BlogCard
                key={blog._id}
                image={blog.image || "/assets/default-blog.png"} // Fallback image
                title={blog.title || "Untitled Blog"}
              />
            ))
          ) : (
            <p>No blog posts available.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default MainPage;
