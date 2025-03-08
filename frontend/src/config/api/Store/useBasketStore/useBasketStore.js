import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useBasketStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          return {
            items: existingItem
              ? state.items.map((i) =>
                  i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                )
              : [...state.items, { ...item, quantity: 1 }],
          };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),
      clearBasket: () => set({ items: [] }),
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () =>
        get()
          .items.reduce((total, item) => total + item.price * item.quantity, 0)
          .toFixed(2),
      checkout: async (userId, shippingAddress) => {
        const items = get().items;
        if (items.length === 0) throw new Error("Basket is empty");

        const totalAmount = parseFloat(get().getTotalPrice());
        const orderData = {
          user_id: userId,
          items: items.map((item) => ({
            product_id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total_amount: totalAmount,
          shipping_address: shippingAddress,
        };
        console.log("Sending Order Data:", orderData); // Add this line
        const response = await fetch("http://localhost:8004/api/v1/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server Error:", errorData); // Add this line
          throw new Error(errorData.detail || "Failed to create order");
        }

        const order = await response.json();
        set({ items: [] });
        return order;
      },
    }),
    {
      name: "basketItems",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useBasketStore;
