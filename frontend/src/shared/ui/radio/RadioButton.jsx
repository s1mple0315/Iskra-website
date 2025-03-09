import styles from "./radiobutton.module.css";

const RadioButton = ({ checked, onChange, id, name, value, className }) => {
  return (
    <label className={`${styles.cont} ${className || ""}`}>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        name={name}
        value={value}
        id={id}
      />
      <div className={styles.radiomark}></div>
    </label>
  );
};

export default RadioButton;
