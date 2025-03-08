export const checkoutOrder = async (userId, shippingAddress, items) => {
  console.log("Checkout Order Payload:", { userId, shippingAddress, items });

  const totalAmount = parseFloat(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  const orderData = {
    user_id: "user123",
    shipping_address: "г. Москва, ул. Ленина, д. 10",
    total_amount: parseFloat(
      items
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2)
    ), // ✅ Ensure float
    status: "pending", // ✅ Ensure status matches API
    items: items.map((item) => ({
      product_id: item.id,
      name: item.name,
      price: parseFloat(item.price), // ✅ Ensure float
      quantity: parseInt(item.quantity), // ✅ Ensure integer
    })),
  };

  console.log(
    "🛑 Final Order Payload Sent:",
    JSON.stringify(orderData, null, 2)
  );

  console.log("Final Order Payload Sent:", JSON.stringify(orderData, null, 2));

  try {
    const response = await fetch("http://localhost:8004/api/v1/orders/", {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🛑 Full Server Error Response:", errorText);
      throw new Error(`Ошибка сервера: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Checkout Order Error:", error);
    throw error;
  }
};
