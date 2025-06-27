import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CheckoutPage({ cartItems, setCartItems }) {
  const navigate = useNavigate();

  const [previousOrders, setPreviousOrders] = useState(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const currentOrder = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      cart: cartItems.map((item) => ({
        ...item,
        image: item.image || item.thumbnail, // ensure image
      })),
      timestamp: Date.now(),
    };

    localStorage.setItem("userAddress", JSON.stringify({
      name: currentOrder.name,
      address: currentOrder.address,
      phone: currentOrder.phone
    }));

    // Save new order
    const updatedOrders = [...previousOrders, currentOrder];
    setPreviousOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    // Clear cart
    setCartItems([]);
    localStorage.removeItem("cart");

    // ✅ Show toast and navigate after it closes
    toast.success("✅ Order placed successfully!", {
      onClose: () => navigate("/orders"), // 👈 navigate after toast finishes
      autoClose: 3000, // 3 seconds
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🧾 Checkout</h2>

      {cartItems.length === 0 ? (
        <p>Cart is empty.</p>
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ marginBottom: "10px" }}>
                <strong>{item.title}</strong> × {item.quantity} = ₹
                {(item.price * item.quantity).toFixed(2)}
              </div>
            ))}
          </div>
          <h3>Total: ₹{total.toFixed(2)}</h3>
          <form onSubmit={handleSubmit}>
            <h4>Shipping Details</h4>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <br />
            <br />
            <button type="submit" style={styles.button}>
              Place Order
            </button>
          </form>
        </>
      )}
    </div>
  );
}

const styles = {
  input: {
    display: "block",
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    backgroundColor: "#FFA41C",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
