import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import Navbar from "./components/Navbar";
import CategoryNavbar from "./components/CategoryNavbar";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AccountPage from "./pages/AccountPage";
import CheckoutPage from "./pages/CheckoutPage";
import WishlistPage from "./pages/WishlistPage";
import AdminApp from "./admin/AdminApp";
import Language from "./pages/Language";
import CustomerOrders from "./pages/CustomerOrders";
import LoginForm from "./pages/LoginForm";
import SignupForm from "./pages/SignupForm";
import ProfilePage from "./pages/ProfilePage";
import AddressPage from "./pages/AddressPage";
import PrivateRoute from "./components/PrivateRoute";
import Loading from "./components/Loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [darkMode, setDarkMode] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [cartInitialized, setCartInitialized] = useState(false);
  const [wishlistInitialized, setWishlistInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      if (firebaseUser) {
        const uid = firebaseUser.uid;

        const cartRef = doc(db, "carts", uid);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists()) {
          setCart(cartSnap.data().items || []);
        } else {
          await setDoc(cartRef, { items: [] });
        }
        setCartInitialized(true);

        const wishRef = doc(db, "wishlists", uid);
        const wishSnap = await getDoc(wishRef);
        if (wishSnap.exists()) {
          setWishlist(wishSnap.data().items || []);
        } else {
          await setDoc(wishRef, { items: [] });
        }
        setWishlistInitialized(true);
      } else {
        setCart([]);
        setWishlist([]);
        setCartInitialized(false);
        setWishlistInitialized(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && cartInitialized) {
      const cartRef = doc(db, "carts", user.uid);
      setDoc(cartRef, { items: cart });
    }
  }, [cart, user, cartInitialized]);

  useEffect(() => {
    if (user && wishlistInitialized) {
      const wishRef = doc(db, "wishlists", user.uid);
      setDoc(wishRef, { items: wishlist });
    }
  }, [wishlist, user, wishlistInitialized]);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((data) => setAllProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const addToCart = (product) => {
    const updatedProduct = {
      ...product,
      image: product.image || product.thumbnail,
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
      toast.success("➕ Quantity increased in cart");
    } else {
      setCart([...cart, { ...updatedProduct, quantity: 1 }]);
      toast.success("🛒 Added to cart");
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

  const toggleFavorite = (product) => {
    const exists = wishlist.find((item) => item.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter((item) => item.id !== product.id));
      toast.info("💔 Removed from wishlist");
    } else {
      setWishlist([...wishlist, product]);
      toast.success("💖 Added to wishlist");
    }
  };

  if (authLoading) return <Loading />;

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
        products={allProducts}
        user={user}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setSelectedCategory={setSelectedCategory}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <CategoryNavbar
        onSelectCategory={setSelectedCategory}
        darkMode={darkMode}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute user={user}>
              <Home
                addToCart={addToCart}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                darkMode={darkMode}
                wishlist={wishlist}
                toggleFavorite={toggleFavorite}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <PrivateRoute user={user}>
              <ProductPage
                addToCart={addToCart}
                toggleWishlist={toggleFavorite}
                wishlist={wishlist}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <PrivateRoute user={user}>
              <CartPage
                cartItems={cart}
                onRemove={removeFromCart}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onAddToCart={addToCart}
                toggleWishlist={toggleFavorite}
                wishlist={wishlist}
                darkMode={darkMode}
                allProducts={allProducts}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/account"
          element={
            <PrivateRoute user={user}>
              <AccountPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute user={user}>
              <CheckoutPage cartItems={cart} setCartItems={setCart} />
            </PrivateRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <PrivateRoute user={user}>
              <WishlistPage
                wishlist={wishlist}
                addToCart={addToCart}
                toggleFavorite={toggleFavorite}
                darkMode={darkMode}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute user={user}>
              <CustomerOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute user={user}>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/address"
          element={
            <PrivateRoute user={user}>
              <AddressPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <PrivateRoute user={user}>
              <AdminApp />
            </PrivateRoute>
          }
        />
        <Route
          path="/language"
          element={
            <PrivateRoute user={user}>
              <Language />
            </PrivateRoute>
          }
        />
      </Routes>

      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
    </div>
  );
}
