import styles from "./CatalogPage.module.css"

import ParentCategory from "../../../entities/components/ParentCategory/ParentCategory"

const CatalogPage = () => {
  return (
    <div className={`${styles.catalogPage}`}>
      <ParentCategory />
      <ParentCategory />
      <ParentCategory />
      <ParentCategory />
      <ParentCategory />
      <ParentCategory />
      <ParentCategory />
      <ParentCategory />
    </div>
  )
}

export default CatalogPage
