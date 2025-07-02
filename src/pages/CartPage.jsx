import { useState, useEffect } from "react";
import axios from "axios";
import Loading from "../components/Loading";
import Cart from "../components/Cart";
import BackButton from "../components/BackButton";
import RecommendedProducts from "../components/RecommendedProducts";

export default function CartPage({
  cartItems,
  onRemove,
  onIncrease,
  onDecrease,
  onAddToCart,
  darkMode,
}) {
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(
    JSON.parse(localStorage.getItem("wishlist")) || []
  );
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get("https://dummyjson.com/products");
        setAllProducts(res.data.products || []);
      } catch (err) {
        console.error("Failed to load products for recommendation", err);
      }
    };
    fetchAll();
  }, []);

  const toggleWishlist = (item) => {
    const exists = wishlist.find((w) => w.id === item.id);
    const updated = exists
      ? wishlist.filter((w) => w.id !== item.id)
      : [...wishlist, item];

    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  if (loading) return <Loading />;

  const lastItem = cartItems[cartItems.length - 1];
  const lastItemCategory =
    allProducts.find((p) => p.id === lastItem?.id)?.category || null;

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
      {/* 🔙 BackButton with top margin and left alignment */}
      <div style={{ width: "100%", marginTop: "40px" }}>
        <BackButton />
      </div>

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

      {/* 💡 Recommended Section */}
      <div style={{ width: "100%", maxWidth: "900px", marginTop: "40px" }}>
        {cartItems.length > 0 && lastItemCategory && (
          <RecommendedProducts
            currentProductId={lastItem.id}
            category={lastItemCategory}
            heading="Customers Also Bought"
            onAddToCart={onAddToCart}
            onToggleWishlist={toggleWishlist}
            wishlistItems={wishlist}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
}
