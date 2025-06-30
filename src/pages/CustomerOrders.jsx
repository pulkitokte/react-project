import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ScrollText } from "lucide-react";
import Loading from "../components/Loading";
import BackButton from "../components/BackButton";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("orders");
      if (saved) {
        setOrders(JSON.parse(saved));
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCancel = (index) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    const updated = [...orders];
    updated.splice(index, 1);
    setOrders(updated);
    localStorage.setItem("orders", JSON.stringify(updated));
    toast.info("❌ Order cancelled successfully.");
  };

  if (loading) return <Loading />;

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <BackButton />
      <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <ScrollText size={28} /> My Orders
      </h2>

      {orders.length === 0 ? (
        <p>You haven’t placed any orders yet.</p>
      ) : (
        orders.map((order, index) => {
          const total = order.cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "25px",
                backgroundColor: "#f9f9f9",
                maxWidth: "600px",
                width: "100%",
              }}
            >
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
                <div
                  key={i}
                  style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "contain",
                      border: "1px solid #ccc",
                      padding: "5px",
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
                style={{
                  backgroundColor: "#ff4d4f",
                  color: "#fff",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
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
