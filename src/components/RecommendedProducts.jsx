import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RecommendedProducts({
  currentProductId = null,
  category = null,
  heading = "You May Also Like",
  onAddToCart,
  onToggleWishlist,
  wishlistItems = [],
}) {
  const [recommended, setRecommended] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("https://dummyjson.com/products");
        setAllProducts(res.data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (allProducts.length) {
      let filtered = allProducts;

      if (currentProductId) {
        filtered = filtered.filter((p) => p.id !== currentProductId);
      }

      if (category && typeof category === "string") {
        filtered = filtered.filter(
          (p) =>
            p.category && p.category.toLowerCase() === category.toLowerCase()
        );
      }

      const sorted = filtered.sort((a, b) => b.rating - a.rating);
      setRecommended(sorted.slice(0, 4));
    }
  }, [allProducts, currentProductId, category]);

  if (!recommended.length) return null;

  return (
    <div style={{ marginTop: "40px" }}>
      <h3
        style={{
          fontSize: "22px",
          fontWeight: "bold",
          marginBottom: "20px",
        }}
      >
        {heading}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {recommended.map((item) => {
          const inWishlist = wishlistItems.some((w) => w.id === item.id);

          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: "20px",
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                alignItems: "center",
                backgroundColor: "#fff",
              }}
              className="dark:bg-zinc-800 dark:text-white"
            >
              {/* Product Image */}
              <img
                src={item.thumbnail}
                alt={item.title}
                onClick={() => navigate(`/product/${item.id}`)}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              />

              {/* Info Section */}
              <div
                onClick={() => navigate(`/product/${item.id}`)}
                style={{ flex: 1, cursor: "pointer" }}
              >
                <h4 style={{ fontWeight: "600", fontSize: "16px" }}>
                  {item.title}
                </h4>
                <p style={{ color: "#888", margin: "4px 0" }}>₹ {item.price}</p>
                <p style={{ fontSize: "14px", color: "#FFA41C" }}>
                  {"★".repeat(Math.round(item.rating))}
                </p>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() =>
                    onAddToCart({ ...item, image: item.thumbnail })
                  }
                  style={{
                    backgroundColor: "#FFA41C",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => onToggleWishlist(item)}
                  style={{
                    fontSize: "18px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {inWishlist ? "❤️" : "🤍"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
