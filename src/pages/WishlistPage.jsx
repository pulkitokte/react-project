import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import BackButton from "../components/BackButton";
import RecommendedProducts from "../components/RecommendedProducts";

export default function WishlistPage({ wishlist, addToCart, toggleFavorite }) {
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get("https://dummyjson.com/products");
        setAllProducts(res.data.products || []);
      } catch (err) {
        console.error("Failed to fetch product list:", err);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    toggleFavorite(product); // remove from wishlist
    toast.success("🛒 Item added to cart!", {
      onClose: () => navigate("/cart"),
      autoClose: 2000,
    });
  };

  if (loading) return <Loading />;

  const lastItem = wishlist[wishlist.length - 1];
  const lastItemCategory =
    allProducts.find((p) => p.id === lastItem?.id)?.category || null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        backgroundColor: "#121212",
        color: "#fff",
        minHeight: "100vh",
        alignItems: "center",
      }}
    >
      {/* Back button with top margin and left alignment */}
      <div style={{ width: "100%", marginTop: "40px" }}>
        <BackButton />
      </div>

      <h1 style={{ marginBottom: "20px" }}>❤️ My Wishlist</h1>

      {wishlist.length === 0 ? (
        <h3>No Item in Wishlist..</h3>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
            width: "100%",
            maxWidth: "1200px",
          }}
        >
          {wishlist.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={handleAddToCart}
              toggleFavorite={toggleFavorite}
              isFavorite={true}
            />
          ))}
        </div>
      )}

      {/* Recommended section */}
      <div style={{ width: "100%", maxWidth: "900px", marginTop: "40px" }}>
        {wishlist.length > 0 && lastItemCategory && (
          <RecommendedProducts
            currentProductId={lastItem?.id}
            category={lastItemCategory}
            heading="You May Also Like"
            onAddToCart={addToCart}
            onToggleWishlist={toggleFavorite}
            wishlistItems={wishlist}
          />
        )}
      </div>
    </div>
  );
}
