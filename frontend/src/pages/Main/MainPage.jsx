import ParentCategory from "../../entities/components/ParentCategory/ParentCategory";
import styles from "./MainPage.module.css";
import BrandLogos from "../../entities/components/BrandLogos/BrandLogos";

const MainPage = () => {

  return (
    <div className={styles.mainPage}>
      <section className={styles.bannerSection}>Banner</section>
      <section className={styles.catalogSection}>
        <ParentCategory  />
      </section>
      <section className={styles.brandLogosSection}>
        <BrandLogos />
      </section>
      <section className={styles.featuredProductsSection}>Featured Products</section>
      <section className={styles.newProductsSection}>New Products</section>
      <section className={styles.blogSection}>Blog</section>
    </div>
  );
};

export default MainPage;