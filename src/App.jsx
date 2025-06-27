import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CategoryNavbar from "./components/CategoryNavbar";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AccountPage from "./pages/AccountPage";
import CheckoutPage from "./pages/CheckoutPage";
import WishlistPage from "./pages/WishlistPage";
import AdminApp from "./admin/AdminApp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Language from "./pages/Language"; // ✅ Update path based on your project
import CustomerOrders from "./pages/CustomerOrders";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./pages/LoginForm";
import SignupForm from "./pages/SignupForm";
import LoginForm from "./pages/LoginForm";


export default function App() {
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    try {
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (err) {
      console.error("Invalid cart JSON in localStorage", err);
      localStorage.removeItem("cart");
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const [wishlist, setWishlist] = useState(() => {
    const stored = localStorage.getItem("wishlist");
    try {
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Invalid wishlist JSON in localStorage", err);
      localStorage.removeItem("wishlist");
      return [];
    }
  });

  const toggleFavorite = (product) => {
    const exists = wishlist.find((item) => item.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter((item) => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const addToCart = (product) => {
    const updatedProduct = {
      ...product,
      image: product.image || product.thumbnail, // ensure 'image' is set
    };

    const exists = cart.find((item) => item.id === updatedProduct.id);
    if (exists) {
      setCart(
        cart.map((item) =>
          item.id === updatedProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...updatedProduct, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
    toast.info("🗑️ Item removed from cart");
  };

  const increaseQuantity = (id) =>
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  const decreaseQuantity = (id) =>
    setCart(
      cart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );

  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  })
  
  return (
    <div
      style={{
        paddingTop: "120px",
        backgroundColor: darkMode ? "#121212" : "#fff",
        color: darkMode ? "#fff" : "#000",
        minHeight: "100vh",
      }}
    >
      <Navbar
        user={user}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setSelectedCategory={setSelectedCategory}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <div>
        <CategoryNavbar
          onSelectCategory={setSelectedCategory}
          darkMode={darkMode}
        />
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              addToCart={addToCart}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              darkMode={darkMode}
              wishlist={wishlist}
              toggleFavorite={toggleFavorite}
            />
          }
        />
        <Route
          path="/product/:id"
          element={<ProductPage addToCart={addToCart} />}
        />
        <Route
          path="/cart"
          element={
            <CartPage
              cartItems={cart}
              onRemove={removeFromCart}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              darkMode={darkMode}
            />
          }
        />
        <Route path="/account" element={<AccountPage />} />
        <Route
          path="/checkout"
          element={<CheckoutPage cartItems={cart} setCartItems={setCart} />}
        />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/language" element={<Language />} />
        <Route path="/orders" element={<CustomerOrders />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />

        <Route
          path="/wishlist"
          element={
            <WishlistPage
              wishlist={wishlist}
              addToCart={addToCart}
              toggleFavorite={toggleFavorite}
            />
          }
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
