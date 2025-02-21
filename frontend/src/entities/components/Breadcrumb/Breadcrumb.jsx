import { useLocation, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Breadcrumb.module.css';

// Function to fetch category names based on ID
const fetchCategoryNameById = async (categoryId) => {
  try {
    const response = await axios.get(`http://localhost:8002/api/v1/categories/${categoryId}`);
    return response.data.name; // Assuming the API returns the category name
  } catch (err) {
    console.error('Failed to fetch category name', err);
    return categoryId; // Return ID as fallback if fetch fails
  }
};

// Function to fetch product name based on ID
const fetchProductNameById = async (productId) => {
  try {
    const response = await axios.get(`http://localhost:8002/api/v1/products/${productId}`);
    return response.data.name; // Assuming the API returns the product name
  } catch (err) {
    console.error('Failed to fetch product name', err);
    return productId; // Return ID as fallback if fetch fails
  }
};

const Breadcrumb = () => {
  const location = useLocation();
  const { parentId, subcategoryId, productId } = useParams(); // Get dynamic params
  const pathnames = location.pathname.split('/').filter(x => x);

  const [breadcrumbNames, setBreadcrumbNames] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch category and product names based on the URL parameters
  useEffect(() => {
    const fetchNames = async () => {
      setLoading(true);

      const names = {};

      // Fetch category names if parentId or subcategoryId is available
      if (parentId) {
        names.parentCategory = await fetchCategoryNameById(parentId);
      }
      if (subcategoryId) {
        names.subcategory = await fetchCategoryNameById(subcategoryId);
      }

      // Fetch product name if productId is available
      if (productId) {
        names.product = await fetchProductNameById(productId);
      }

      setBreadcrumbNames(names);
      setLoading(false);
    };

    fetchNames();
  }, [parentId, subcategoryId, productId]); // Re-run when any of the params change

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumbNav}>
      <ol className={styles.breadcrumbList}>
        <li className={`${styles.breadcrumbItem} ${styles.homeItem}`}>
          <a href="/" className={styles.breadcrumbLink}>Home</a>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          // Replace IDs with dynamic names
          const displayName = isNaN(name) ? name : breadcrumbNames[name] || name;

          return (
            <li key={name} className={`${styles.breadcrumbItem} ${isLast ? styles.activeItem : ''}`} aria-current={isLast ? 'page' : undefined}>
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
