import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SearchBar.module.css";
import Search from "../../../shared/ui/icons/Layout/Header/Search/Search";

const SearchBar = ({ onSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch search suggestions with debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 1) {
        setSuggestions([]);
        return;
      }
      const response = await fetch(
        `http://localhost:8002/api/v1/products/search?query=${encodeURIComponent(searchQuery)}&page=1&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300); // Debounce 300ms
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      onSearchResults(suggestions); // Pass results to parent
      setSuggestions([]);
      // Navigate to search page as fallback
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = async (product) => {
    setSearchQuery(product.name);
    setSuggestions([]);
    // Fetch parent category to get parentId
    const categoryResponse = await fetch(
      `http://localhost:8002/api/v1/categories/${product.category_id}`
    );
    let parentId = product.category_id; // Default to subcategoryId if fetch fails
    if (categoryResponse.ok) {
      const categoryData = await categoryResponse.json();
      parentId = categoryData.parent_id || categoryData._id; // Use parent_id if exists
    }
    navigate(`/catalog/${parentId}/${product.category_id}/${product._id}`);
  };

  return (
    <div
      className={`${styles.searchBarContainer} d-flex justify-content-between align-items-center`}
    >
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleSearch}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder="Поиск товаров"
        className={styles.searchInput}
      />
      <button onClick={handleSearch} className={styles.searchButton}>
        <Search />
      </button>
      {isFocused && suggestions.length > 0 && (
        <div className={styles.suggestionsDropdown}>
          {suggestions.map((product) => (
            <div
              key={product._id}
              className={styles.suggestionItem}
              onClick={() => handleSuggestionClick(product)}
            >
              <img
                src={product.images?.[0] || "/assets/default-product.png"}
                alt={product.name}
                className={styles.suggestionImage}
              />
              <div className={styles.suggestionDetails}>
                <p className={styles.suggestionName}>{product.name}</p>
                <p className={styles.suggestionPrice}>
                  {product.price.toLocaleString("ru-RU")} ₽
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;