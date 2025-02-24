import ChevronLeft from "../../../shared/ui/icons/Chevron/ChevronDown/ChevronLeft";
import ChevronRight from "../../../shared/ui/icons/Chevron/ChevronDown/ChevronRight";
import styles from "./Pagination.module.css";

const Pagination = ({ currentPage, totalCount, limit, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / limit);

  const pageNumbers = totalPages > 1
    ? [...Array(totalPages - 1).keys()].map((i) => i + 1)
    : [];

  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft />
      </button>

      <div className={styles.pageNumbers}>
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={currentPage === page ? styles.active : ""}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight />
      </button>

      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(totalPages)}
          className={currentPage === totalPages ? styles.active : ""}
        >
          {totalPages}
        </button>
      )}
    </div>
  );
};

export default Pagination;
