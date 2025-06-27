import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("orders");
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  }, []);

  const handleCancel = (index) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (!confirmCancel) return;

    const updatedOrders = [...orders];
    updatedOrders.splice(index, 1); // remove that order
    setOrders(updatedOrders); // ✅ update the UI
    localStorage.setItem("orders", JSON.stringify(updatedOrders)); // ✅ update storage
    toast.info("❌ Order cancelled successfully.");
  };

  return (
    <div style={styles.wrapper}>
      <h2>🧾 My Orders</h2>

      {orders.length === 0 ? (
        <p>You haven’t placed any orders yet.</p>
      ) : (
        orders.map((order, index) => {
          const total = order.cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return (
            <div key={index} style={styles.orderCard}>
              <h3>Order #{index + 1}</h3>
              <p>
                <strong>Placed on:</strong>{" "}
                {new Date(order.timestamp).toLocaleString()}
              </p>
              <p>
                <strong>Name:</strong> {order.name}
              </p>
              <p>
                <strong>Address:</strong> {order.address}
              </p>
              <p>
                <strong>Phone:</strong> {order.phone}
              </p>

              <h4>🛒 Products:</h4>
              {order.cart.map((item, i) => (
                <div key={i} style={styles.itemRow}>
                  <img
                    src={item.image || "https://via.placeholder.com/60"}
                    alt={item.title}
                    style={styles.thumbnail}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/60";
                    }}
                  />
                  <div>
                    <p style={{ margin: 0 }}>{item.title}</p>
                    <p style={{ margin: 0 }}>
                      ₹ {item.price} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}

              <h4>Total: ₹{total.toFixed(2)}</h4>

              <button
                onClick={() => handleCancel(index)}
                style={styles.cancelBtn}
              >
                Cancel Order
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "20px",
  },
  orderCard: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "25px",
    backgroundColor: "#f9f9f9",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "10px",
  },
  thumbnail: {
    width: "60px",
    height: "60px",
    objectFit: "contain",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    padding: "5px",
  },
  cancelBtn: {
    backgroundColor: "#ff4d4f",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
};
