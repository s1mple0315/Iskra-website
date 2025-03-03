import styles from "./BrandLogos.module.css";

const BrandLogos = () => {
  const brands = [
    { name: "Apple", src: "/assets/apple.png" },
    { name: "Samsung", src: "/assets/samsung.png" },
    { name: "Dyson", src: "/assets/dyson.png" },
    { name: "Sony", src: "/assets/sony.png" },
    { name: "JBL", src: "/assets/jbl.png" },
    { name: "Rndeks", src: "/assets/rndeks.png" },
  ];

  return (
    <section className={styles.brandLogosSection}>
      <div className={styles.brandLogosContainer}>
        {brands.map((brand) => (
          <img
            key={brand.name}
            src={brand.src}
            alt={`${brand.name} Logo`}
            className={styles.brandLogo}
          />
        ))}
      </div>
    </section>
  );
};

export default BrandLogos;