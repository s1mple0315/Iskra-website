import styles from './BasketSummary.module.css'

const BasketSummary = () => {
  return (
    <div className={`${styles.basketSummary} d-flex flex-column`}>
      <div className={styles.basketSummaryUpper}> </div>
      
      <div className={styles.basketSummaryBottom}></div>
    </div>
  )
}

export default BasketSummary
