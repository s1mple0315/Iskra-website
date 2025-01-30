import { useLocation } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumbNav}>
      <ol className={styles.breadcrumbList}>
        <li className={`${styles.breadcrumbItem} ${styles.homeItem}`}>
          <a href="/" className={styles.breadcrumbLink}>Home</a>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          return (
            <li key={name} className={`${styles.breadcrumbItem} ${isLast ? styles.activeItem : ''}`} aria-current={isLast ? 'page' : undefined}>
              {isLast ? (
                name.charAt(0).toUpperCase() + name.slice(1)
              ) : (
                <a href={routeTo} className={styles.breadcrumbLink}>{name.charAt(0).toUpperCase() + name.slice(1)}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;