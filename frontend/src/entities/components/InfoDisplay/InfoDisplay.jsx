import styles from "./InfoDisplay.module.css";

const InfoDisplay = ({title, text}) => {
  return (
    <div className={`${styles.infoDisplay} d-flex flex-column`}>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
};

export default InfoDisplay;
