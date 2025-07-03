import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../components/Loading";
import Cart from "../components/Cart";
import BackButton from "../components/BackButton";
import RecommendedProducts from "../components/RecommendedProducts";

export default function CartPage({ darkMode }) {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState(
    JSON.parse(localStorage.getItem("wishlist")) || []
  );
  const [allProducts, setAllProducts] = useState([]);

  // 🔄 Load cart from localStorage
  useEffect(() => {
    if (user) {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (err) {
          console.error("❌ Error parsing cart from localStorage", err);
        }
      }
    }
    setLoading(false);
  }, [user]);

  // 💾 Save cart to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // 📦 Load all products (for recommendation)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get("https://dummyjson.com/products");
        setAllProducts(res.data.products || []);
      } catch (err) {
        console.error("❌ Failed to load products for recommendation", err);
      }
    };
    fetchAll();
  }, []);

  // ❤️ Toggle Wishlist
  const toggleWishlist = (item) => {
    const exists = wishlist.find((w) => w.id === item.id);
    const updated = exists
      ? wishlist.filter((w) => w.id !== item.id)
      : [...wishlist, item];

    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  // 🛒 Cart operations
  const onAddToCart = (product) => {
    let updatedCart;
    const exists = cartItems.find((item) => item.id === product.id);
    if (exists) {
      updatedCart = cartItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cartItems, { ...product, quantity: 1 }];
    }

    setCartItems(updatedCart);
  };

  const onRemove = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const onIncrease = (id) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const onDecrease = (id) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
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
      <div style={{ width: "100%", marginTop: "40px" }}>
        <BackButton />
      </div>

      {user ? (
        <>
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
        </>
      ) : (
        <h2 style={{ marginTop: "40px" }}>
          🚫 Please log in to view your cart.
        </h2>
      )}
    </div>
  );
}
