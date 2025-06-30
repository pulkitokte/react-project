import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import BackButton from "../components/BackButton"; // ✅ Back button
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function WishlistPage({ wishlist, addToCart, toggleFavorite }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    toggleFavorite(product);
    toast.success("🛒 Item added to cart!", {
      onClose: () => navigate("/cart"),
      autoClose: 2000,
    });
  };

  if (loading) return <Loading />;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        paddingTop:"100px",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <BackButton />

      <h1>❤️ My Wishlist</h1>

      {wishlist.length === 0 ? (
        <h3>No Item in Wishlist..</h3>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
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
    </div>
  );
}
