import styles from "./Layout.module.css";

import Footer from "../entities/components/Footer/Footer";
import Header from "../entities/components/Header/Header";
import Breadcrumb from "../entities/components/Breadcrumb/Breadcrumb";
import StaticServices from "../entities/components/static/staticServices/StaticServices";

const Layout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={`${styles.content} container`}>
        <Breadcrumb />
        {children}
      </main>
      <div className="container mt-5">
        <StaticServices />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
