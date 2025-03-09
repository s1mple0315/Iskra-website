import { useLocation, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Breadcrumb.module.css';

const fetchCategoryNameById = async (categoryId) => {
  try {
    const response = await axios.get(`http://localhost:8002/api/v1/categories/${categoryId}`);
    return response.data.name;
  } catch (err) {
    return categoryId; 
  }
};

const fetchProductNameById = async (productId) => {
  try {
    const response = await axios.get(`http://localhost:8002/api/v1/products/${productId}`);
    return response.data.name; 
  } catch (err) {
    return productId; 
  }
};

const Breadcrumb = () => {
  const location = useLocation();
  const { parentId, subcategoryId, productId } = useParams(); 
  const pathnames = location.pathname.split('/').filter(x => x);

  const [breadcrumbNames, setBreadcrumbNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNames = async () => {
      setLoading(true);
      const names = {};

      if (parentId) {
        names[parentId] = await fetchCategoryNameById(parentId);
      }
      if (subcategoryId) {
        names[subcategoryId] = await fetchCategoryNameById(subcategoryId);
      }
      if (productId) {
        names[productId] = await fetchProductNameById(productId);
      }

      setBreadcrumbNames(names);
      setLoading(false);
    };

    fetchNames();
  }, [parentId, subcategoryId, productId]); 

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumbNav}>
      <ol className={styles.breadcrumbList}>
        <li key="home" className={`${styles.breadcrumbItem} ${styles.homeItem}`}>
          <a href="/" className={styles.breadcrumbLink}>Home</a>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          const uniqueKey = `${index}-${name}`;

          const displayName = breadcrumbNames[name] || name;

          return (
            <li key={uniqueKey} className={`${styles.breadcrumbItem} ${isLast ? styles.activeItem : ''}`} aria-current={isLast ? 'page' : undefined}>
              {isLast ? (
                displayName.charAt(0).toUpperCase() + displayName.slice(1)
              ) : (
                <a href={routeTo} className={styles.breadcrumbLink}>{displayName.charAt(0).toUpperCase() + displayName.slice(1)}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;