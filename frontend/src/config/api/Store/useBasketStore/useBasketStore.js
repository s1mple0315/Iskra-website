import { create } from 'zustand';

const useBasketStore = create((set, get) => ({
  items: [],

  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }));
  },

  clearBasket: () => {
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  },

  checkout: async (userId, shippingAddress) => {
    const items = get().items;
    if (items.length === 0) {
      throw new Error('Basket is empty');
    }

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

    const response = await fetch('http://localhost:8001/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create order');
    }

    const order = await response.json();
    set({ items: [] }); 
    return order; 
  },
}));

export default useBasketStore;