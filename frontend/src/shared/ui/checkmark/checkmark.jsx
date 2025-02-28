import styles from "./checkmark.module.css";
// import PropTypes from "prop-types";
const Checkmark = ({ checked, onChange, disabled, id, className }) => {
  return (
    <label className={`${styles.cont} ${className || ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        id={id}
      />
      <div className={styles.checkmark}></div>
    </label>
  );
};

// Checkmark.propTypes = {
//   checked: PropTypes.bool,
//   onChange: PropTypes.func,
//   disabled: PropTypes.bool,
//   id: PropTypes.string,
//   className: PropTypes.string,
// };

// Checkmark.defaultProps = {
//   checked: false,
//   onChange: () => {},
//   disabled: false,
//   id: null,
//   className: "",
// };

export default Checkmark;
