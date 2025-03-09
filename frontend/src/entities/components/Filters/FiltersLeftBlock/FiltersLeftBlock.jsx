import Accordion from "../../Accordion/Accordion";
import styles from "./FiltersLeftBlock.module.css";
import useFilterStore from "../../../../config/api/Store/useFilterStore/useFilterStore";
import Checkmark from "../../../../shared/ui/checkmark/checkmark";
import RadioButton from "../../../../shared/ui/radio/RadioButton";

const FiltersLeftBlock = ({ products = [] }) => {
  const { filters, setFilter } = useFilterStore();

  const safeProducts = products || [];
  const uniqueBrands = [
    ...new Set(safeProducts.map((p) => p.brand).filter(Boolean)),
  ];
  const uniqueSeries = [
    ...new Set(safeProducts.map((p) => p.series).filter(Boolean)),
  ];
  const uniqueMemories = [
    ...new Set(safeProducts.map((p) => p.memory).filter(Boolean)),
  ];
  const uniqueSimCards = [
    ...new Set(safeProducts.map((p) => p.simCard).filter(Boolean)),
  ];
  const uniqueProcessorTypes = [
    ...new Set(safeProducts.map((p) => p.processorType).filter(Boolean)),
  ];
  const uniqueColors = [
    ...new Set(safeProducts.map((p) => p.color).filter(Boolean)),
  ];
  const prices = safeProducts.map((p) => p.price || 0).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : Infinity;

  return (
    <div className={styles.filtersLeftBlock}>
      <Accordion title="Бренд">
        <div className={styles.accordionContent}>
          <div className="d-flex gap-2">
            <RadioButton
              checked={!filters.brand}
              onChange={() => setFilter("brand", null)}
              name="brand"
              value=""
            />
            <span>Все</span>
          </div>
          {uniqueBrands.map((brand) => (
            <div key={brand} className="d-flex gap-2">
              <RadioButton
                checked={filters.brand === brand}
                onChange={() => setFilter("brand", brand)}
                name="brand"
                value={brand}
              />
              <span>{brand}</span>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion title="Цена">
        <div className={styles.accordionContent}>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={filters.price.min}
            onChange={(e) =>
              setFilter("price", { min: parseInt(e.target.value) })
            }
            disabled={maxPrice === Infinity}
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={filters.price.max}
            onChange={(e) =>
              setFilter("price", { max: parseInt(e.target.value) })
            }
            disabled={maxPrice === Infinity}
          />
          <p>
            От {filters.price.min}₽ до {filters.price.max}₽
          </p>
        </div>
      </Accordion>

      <Accordion title="Серия">
        <div className={styles.accordionContent}>
          <div className="d-flex gap-2">
            <Checkmark
              checked={filters.series.length === 0}
              onChange={() => setFilter("series", [])}
            />
            <span>Все</span>
          </div>
          {uniqueSeries.map((series) => (
            <div key={series} className="d-flex gap-2">
              <Checkmark
                checked={filters.series.includes(series)}
                onChange={(e) =>
                  setFilter(
                    "series",
                    e.target.checked
                      ? [...filters.series, series]
                      : filters.series.filter((s) => s !== series)
                  )
                }
              />
              <span>{series}</span>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion title="Сортировка">
        <div className={styles.accordionContent}>
          <div className="d-flex gap-2">
            <RadioButton
              checked={filters.sortBy === "price"}
              onChange={() => setFilter("sortBy", "price")}
              name="sort"
              value="price"
            />
            <span>По цене</span>
          </div>
          <div className="d-flex gap-2">
            <RadioButton
              checked={filters.sortBy === "stock"}
              onChange={() => setFilter("sortBy", "stock")}
              name="sort"
              value="stock"
            />
            <span>По наличию</span>
          </div>

          <div className="d-flex gap-2">
            <RadioButton
              checked={filters.sortBy === "name"}
              onChange={() => setFilter("sortBy", "name")}
              name="sort"
              value="name"
            />
            <span>По названию</span>
          </div>
          <div className="d-flex gap-2">
            <RadioButton
              checked={filters.order === "asc"}
              onChange={() => setFilter("order", "asc")}
              name="order"
              value="asc"
            />
            <span>По возрастанию</span>
          </div>
          <div className="d-flex gap-2">
            <RadioButton
              checked={filters.order === "desc"}
              onChange={() => setFilter("order", "desc")}
              name="order"
              value="desc"
            />
            <span>По убыванию</span>
          </div>
        </div>
      </Accordion>
    </div>
  );
};

export default FiltersLeftBlock;
