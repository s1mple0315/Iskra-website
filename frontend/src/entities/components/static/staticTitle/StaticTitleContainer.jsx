import styles from "./StaticTitleContainer.module.css";


const StaticTitleContainer = ({ title, icon }) => {
  return (
    <div
      className={`${styles.container} d-flex justify-content-between align-items-center`}
    >
      <h1>{title}</h1>
      {icon}
    </div>
  );
};

export default StaticTitleContainer;
