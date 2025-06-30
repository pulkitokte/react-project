import { Link } from "react-router-dom";
import { Plus, Minus, Trash2 } from "lucide-react";

export default function Cart({
  cartItems,
  onRemove,
  onIncrease,
  onDecrease,
  darkMode,
}) {
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div>
      {/* ❌ Removed duplicated <h1> title */}

      {cartItems.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "18px" }}>Cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div
              key={item.id}
              style={{
                ...styles.cartItem,
                backgroundColor: darkMode ? "#1f1f1f" : "#f9f9f9",
                color: darkMode ? "#fff" : "#000",
              }}
            >
              <img
                src={item.thumbnail || item.image || item.images?.[0]}
                alt={item.title}
                style={styles.img}
              />
              <div>
                <h2>{item.title}</h2>
                <p>Price: ₹{item.price}</p>
                <p>Quantity: {item.quantity}</p>
                <div style={{ display: "flex", gap: "10px", margin: "10px 0" }}>
                  <button
                    onClick={() => onIncrease(item.id)}
                    style={styles.btn}
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => onDecrease(item.id)}
                    style={styles.btn}
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    style={styles.remBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <h2 style={styles.total}>Total: ₹{total.toFixed(2)}</h2>
          <Link to="/checkout" style={styles.proceed}>
            <button
              style={{
                marginTop: "20px",
                padding: "10px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Proceed to Checkout
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

const styles = {
  cartItem: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  img: {
    width: "100px",
    height: "100px",
    objectFit: "contain",
    border: "1px solid #ccc",
    padding: "5px",
    borderRadius: "5px",
    backgroundColor: "#fff",
  },
  btn: {
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#eee",
    cursor: "pointer",
  },
  remBtn: {
    padding: "8px 10px",
    border: "1px solid red",
    borderRadius: "5px",
    backgroundColor: "#ffdddd",
    cursor: "pointer",
    color: "red",
  },
  total: {
    textAlign: "right",
    fontSize: "24px",
    marginRight: "30px",
  },
  proceed: {
    display: "flex",
    justifyContent: "center",
  },
};
