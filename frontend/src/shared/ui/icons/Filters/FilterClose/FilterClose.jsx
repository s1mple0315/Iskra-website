const FilterClose = ({ onClick }) => {
  return (
    <svg
      onClick={onClick}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        opacity="0.5"
        d="M1 1L9 9M17 17L9 9M9 9L1 17L17 1"
        stroke="#1F2029"
        strokeWidth="2"
      />
    </svg>
  );
};

export default FilterClose;
