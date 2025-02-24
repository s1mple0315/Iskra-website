import ChevronLeft from "../../../shared/ui/icons/Chevron/ChevronDown/ChevronLeft";
import ChevronRight from "../../../shared/ui/icons/Chevron/ChevronDown/ChevronRight";
import styles from "./Pagination.module.css";

const Pagination = ({ currentPage, totalCount, limit, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / limit);

  // If totalPages is less than 2, don't create the page numbers array
  const pageNumbers = totalPages > 1
    ? [...Array(totalPages - 1).keys()].map((i) => i + 1)
    : [];

  return (
    <div className={styles.pagination}>
      {/* Left Chevron */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft />
      </button>

      {/* Page numbers (excluding last one) */}
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

      {/* Right Chevron */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight />
      </button>

      {/* Last page */}
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
