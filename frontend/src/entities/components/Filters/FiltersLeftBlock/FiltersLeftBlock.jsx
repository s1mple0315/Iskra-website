import Accordion from "../../Accordion/Accordion";
import styles from "./FiltersLeftBlock.module.css";
import useFilterStore from "../../../../config/api/Store/useFilterStore/useFilterStore";

const FiltersLeftBlock = ({ products = [] }) => {
  const { filters, setFilter } = useFilterStore();

  const safeProducts = products || [];
  const uniqueBrands = safeProducts.length > 0 ? [...new Set(safeProducts.map((p) => p.brand).filter(Boolean))] : [];
  const uniqueSeries = safeProducts.length > 0 ? [...new Set(safeProducts.map((p) => p.series).filter(Boolean))] : [];
  const uniqueMemories = safeProducts.length > 0 ? [...new Set(safeProducts.map((p) => p.memory).filter(Boolean))] : [];
  const uniqueSimCards = safeProducts.length > 0 ? [...new Set(safeProducts.map((p) => p.simCard).filter(Boolean))] : [];
  const uniqueProcessorTypes = safeProducts.length > 0 ? [...new Set(safeProducts.map((p) => p.processorType).filter(Boolean))] : [];
  const uniqueColors = safeProducts.length > 0 ? [...new Set(safeProducts.map((p) => p.color).filter(Boolean))] : [];
  const prices = safeProducts.length > 0 ? safeProducts.map((p) => p.price || 0).filter((p) => p > 0) : [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : Infinity;

  return (
    <div className={styles.filtersLeftBlock}>
      <Accordion title={"Бренд"}>
        <div>
          <label>
            <input
              type="radio"
              name="brand"
              value=""
              checked={!filters.brand}
              onChange={() => setFilter('brand', null)}
            />
            Все
          </label>
          {uniqueBrands.map((brand) => (
            <label key={brand}>
              <input
                type="radio"
                name="brand"
                value={brand}
                checked={filters.brand === brand}
                onChange={() => setFilter('brand', brand)}
              />
              {brand}
            </label>
          ))}
        </div>
      </Accordion>
      <Accordion title={"Цена"}>
        <div>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={filters.price.min}
            onChange={(e) => setFilter('price', { min: parseInt(e.target.value) })}
            disabled={maxPrice === Infinity}
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={filters.price.max}
            onChange={(e) => setFilter('price', { max: parseInt(e.target.value) })}
            disabled={maxPrice === Infinity}
          />
          <p>От {filters.price.min}₽ до {filters.price.max}₽</p>
        </div>
      </Accordion>
      <Accordion title={"Серия"}>
        <div>
          <label>
            <input
              type="checkbox"
              checked={filters.series.length === 0}
              onChange={() => setFilter('series', [])}
            />
            Все
          </label>
          {uniqueSeries.map((series) => (
            <label key={series}>
              <input
                type="checkbox"
                checked={filters.series.includes(series)}
                onChange={(e) => setFilter('series', e.target.checked ? [...filters.series, series] : filters.series.filter((s) => s !== series))}
              />
              {series}
            </label>
          ))}
        </div>
      </Accordion>
      <Accordion title={"Память"}>
        <div>
          <label>
            <input
              type="checkbox"
              checked={filters.memory.length === 0}
              onChange={() => setFilter('memory', [])}
            />
            Все
          </label>
          {uniqueMemories.map((memory) => (
            <label key={memory}>
              <input
                type="checkbox"
                checked={filters.memory.includes(memory)}
                onChange={(e) => setFilter('memory', e.target.checked ? [...filters.memory, memory] : filters.memory.filter((m) => m !== memory))}
              />
              {memory}
            </label>
          ))}
        </div>
      </Accordion>
      <Accordion title={"SIM-карта"}>
        <div>
          <label>
            <input
              type="checkbox"
              checked={filters.simCard.length === 0}
              onChange={() => setFilter('simCard', [])}
            />
            Все
          </label>
          {uniqueSimCards.map((simCard) => (
            <label key={simCard}>
              <input
                type="checkbox"
                checked={filters.simCard.includes(simCard)}
                onChange={(e) => setFilter('simCard', e.target.checked ? [...filters.simCard, simCard] : filters.simCard.filter((s) => s !== simCard))}
              />
              {simCard}
            </label>
          ))}
        </div>
      </Accordion>
      <Accordion title={"Тип процессора"}>
        <div>
          <label>
            <input
              type="checkbox"
              checked={filters.processorType.length === 0}
              onChange={() => setFilter('processorType', [])}
            />
            Все
          </label>
          {uniqueProcessorTypes.map((processorType) => (
            <label key={processorType}>
              <input
                type="checkbox"
                checked={filters.processorType.includes(processorType)}
                onChange={(e) => setFilter('processorType', e.target.checked ? [...filters.processorType, processorType] : filters.processorType.filter((p) => p !== processorType))}
              />
              {processorType}
            </label>
          ))}
        </div>
      </Accordion>
      <Accordion title={"Цвет"}>
        <div>
          <label>
            <input
              type="checkbox"
              checked={filters.color.length === 0}
              onChange={() => setFilter('color', [])}
            />
            Все
          </label>
          {uniqueColors.map((color) => (
            <label key={color}>
              <input
                type="checkbox"
                checked={filters.color.includes(color)}
                onChange={(e) => setFilter('color', e.target.checked ? [...filters.color, color] : filters.color.filter((c) => c !== color))}
              />
              {color}
            </label>
          ))}
        </div>
      </Accordion>
      <Accordion title={"Сортировка"}>
        <div>
          <label>
            <input
              type="radio"
              name="sort"
              value="price"
              checked={filters.sortBy === 'price'}
              onChange={() => setFilter('sortBy', 'price')}
            />
            По цене
          </label>
          <label>
            <input
              type="radio"
              name="sort"
              value="stock"
              checked={filters.sortBy === 'stock'}
              onChange={() => setFilter('sortBy', 'stock')}
            />
            По наличию
          </label>
          <label>
            <input
              type="radio"
              name="sort"
              value="name"
              checked={filters.sortBy === 'name'}
              onChange={() => setFilter('sortBy', 'name')}
            />
            По названию
          </label>
          <label>
            <input
              type="radio"
              name="order"
              value="asc"
              checked={filters.order === 'asc'}
              onChange={() => setFilter('order', 'asc')}
            />
            По возрастанию
          </label>
          <label>
            <input
              type="radio"
              name="order"
              value="desc"
              checked={filters.order === 'desc'}
              onChange={() => setFilter('order', 'desc')}
            />
            По убыванию
          </label>
        </div>
      </Accordion>
    </div>
  );
};

export default FiltersLeftBlock;