import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loading from "../components/Loading";
import Cart from "../components/Cart";

export default function CartPage({
  cartItems,
  onRemove,
  onIncrease,
  onDecrease,
  darkMode,
}) {
  const location = useLocation();
  const [loading, setLoading] = useState(location.state?.showLoader || false);

  useEffect(() => {
    if (location.state?.showLoader) {
      const timer = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  if (loading) return <Loading />;

  return (
    <div
      className="cart-page"
      style={{
        padding: "20px",
        backgroundColor: darkMode ? "#121212" : "#fff",
        color: darkMode ? "#fff" : "#000",
        minHeight: "100vh",
      }}
    >
      <Cart
        cartItems={cartItems}
        onRemove={onRemove}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        darkMode={darkMode}
      />
    </div>
  );
}
