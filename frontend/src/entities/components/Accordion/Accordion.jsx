import { useState } from "react";
import styles from "./Accordion.module.css";

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.accordion}>
      <button
        className={`${styles.accordionButton} ${isOpen ? styles.active : ""}`}
        onClick={toggleAccordion}
      >
        <span className={styles.icon}>{isOpen ? "-" : "+"}</span>
        {title}
      </button>
      {isOpen && <div className={styles.content}>{children}</div>}
    </div>
  );
};

export default Accordion;
