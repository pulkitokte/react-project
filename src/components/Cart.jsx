import { Link } from "react-router-dom";

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
      <h1 style={styles.cart}>🛒 Your Cart</h1>

      {cartItems.length === 0 ? (
        <p>Cart is empty.</p>
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
                <button onClick={() => onIncrease(item.id)} style={styles.btn}>
                  +
                </button>
                <button onClick={() => onDecrease(item.id)} style={styles.btn}>
                  -
                </button>
                <button onClick={() => onRemove(item.id)} style={styles.remBtn}>
                  Remove
                </button>
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
    margin: "10px 0",
    gap: "20px",
    borderBottom: "1px solid #ccc",
    paddingBottom: "10px",
    borderRadius: "6px",
    padding: "15px",
  },
  img: {
    width: "80px",
    height: "80px",
    objectFit: "contain",
  },
  cart: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    margin: "5px",
    padding: "5px 8px",
    borderRadius: "5px",
    border: "none",
    outline: "none",
  },
  remBtn: {
    margin: "10px",
    padding: "5px",
    border: "none",
    outline: "none",
    borderRadius: "5px",
    backgroundColor: "red",
  },
  proceed: {
    display: "flex",
    justifyContent: "center",
    textDecoration: "none",
  },
};
