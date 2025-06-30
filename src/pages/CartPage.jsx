import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import Cart from "../components/Cart";
import BackButton from "../components/BackButton";

export default function CartPage({
  cartItems,
  onRemove,
  onIncrease,
  onDecrease,
  darkMode,
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loading />;

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: darkMode ? "#121212" : "#fff",
        color: darkMode ? "#fff" : "#000",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <BackButton />
      <h1 style={{ marginBottom: "20px" }}>🛒 Your Cart</h1>
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <Cart
          cartItems={cartItems}
          onRemove={onRemove}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}
