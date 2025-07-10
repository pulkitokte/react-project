import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../components/Loading";
import Cart from "../components/Cart";
import BackButton from "../components/BackButton";
import RecommendedProducts from "../components/RecommendedProducts";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../utils/lang";

export default function CartPage({
  darkMode,
  cartItems,
  onRemove,
  onIncrease,
  onDecrease,
  onAddToCart,
  toggleWishlist,
  wishlist,
}) {
  const [user, loadingAuth] = useAuthState(auth);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [allProducts, setAllProducts] = useState([]);

  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("https://dummyjson.com/products");
        setAllProducts(res.data.products || []);
      } catch (err) {
        console.error("❌ Failed to fetch products", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  if (loadingAuth || loadingProducts) return <Loading />;

  const lastItem = cartItems[cartItems.length - 1];
  const lastItemCategory =
    allProducts.find((p) => p.id === lastItem?.id)?.category || null;

  return (
    <div
      className={`${
        darkMode ? "bg-[#121212] text-white" : "bg-white text-black"
      } min-h-screen flex flex-col items-center px-4 pt-24`}
    >
      <div className="w-full max-w-6xl">
        <BackButton />

        {user ? (
          <>
            <h1 className="text-center text-3xl font-semibold mb-6">
              🛒 {t.yourCart}
            </h1>

            <div className="w-full">
              <Cart
                cartItems={cartItems}
                onRemove={onRemove}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                darkMode={darkMode}
              />
            </div>

            {cartItems.length > 0 && lastItemCategory && (
              <div className="w-full mt-10">
                <RecommendedProducts
                  currentProductId={lastItem.id}
                  category={lastItemCategory}
                  heading={t.customersAlsoBought}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={toggleWishlist}
                  wishlistItems={wishlist}
                  darkMode={darkMode}
                />
              </div>
            )}
          </>
        ) : (
          <h2 className="mt-10 text-xl">🚫 {t.pleaseLoginToViewCart}</h2>
        )}
      </div>
    </div>
  );
}
