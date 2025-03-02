import { create } from "zustand";

const useFilterStore = create((set, get) => ({
  filters: {
    brand: null,
    price: { min: 0, max: Infinity },
    series: [],
    memory: [],
    simCard: [],
    processorType: [],
    color: [],
    sortBy: "price",
    order: "asc",
    page: 1,
    limit: 10,
  },

  setFilter: (filterType, value) => {
    set((state) => {
      const newFilters = { ...state.filters };
      if (filterType === "price") {
        newFilters[filterType] = { ...newFilters[filterType], ...value };
      } else if (
        filterType === "sortBy" ||
        filterType === "order" ||
        filterType === "page" ||
        filterType === "limit"
      ) {
        newFilters[filterType] = value;
      } else {
        newFilters[filterType] = value === "all" ? [] : [value];
      }
      return { filters: newFilters };
    });
  },

  clearFilters: () => {
    set({
      filters: {
        brand: null,
        price: { min: 0, max: Infinity },
        series: [],
        memory: [],
        simCard: [],
        processorType: [],
        color: [],
        sortBy: "price",
        order: "asc",
        page: 1,
        limit: 10,
      },
    });
  },

  getFilterQuery: () => {
    const { filters } = get();
    const query = new URLSearchParams();
    if (filters.brand) query.append("brand", filters.brand);
    if (filters.price.min > 0) query.append("min_price", filters.price.min);
    if (filters.price.max < Infinity)
      query.append("max_price", filters.price.max);
    query.append("sort_by", filters.sortBy);
    query.append("order", filters.order);
    query.append("page", filters.page);
    query.append("limit", filters.limit);
    return query.toString();
  },
}));

export default useFilterStore;
