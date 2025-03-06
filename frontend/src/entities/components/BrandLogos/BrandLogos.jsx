import styles from "./BrandLogos.module.css";

const BrandLogos = () => {
  const brands = [
    { name: "Apple", src: "/assets/Main/Slider/apple.png" },
    { name: "Samsung", src: "/assets/Main/Slider/samsung.png" },
    { name: "Dyson", src: "/assets/Main/Slider/dyson.png" },
    { name: "Sony", src: "/assets/Main/Slider/sony.png" },
    { name: "JBL", src: "/assets/Main/Slider/jbl.png" },
    { name: "Rndeks", src: "/assets/Main/Slider/yandex.png" },
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