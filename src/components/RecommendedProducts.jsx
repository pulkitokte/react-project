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
    <div className="mt-10">
      <h3 className="text-xl font-bold mb-5">{heading}</h3>

      <div className="flex flex-col gap-5">
        {recommended.map((item) => {
          const inWishlist = wishlistItems.some((w) => w.id === item.id);

          return (
            <div
              key={item.id}
              className="flex items-center gap-5 p-4 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 transition hover:shadow"
            >
              {/* Product Image */}
              <img
                src={item.thumbnail}
                alt={item.title}
                onClick={() => navigate(`/product/${item.id}`)}
                className="w-24 h-24 object-cover rounded cursor-pointer"
              />

              {/* Info Section */}
              <div
                onClick={() => navigate(`/product/${item.id}`)}
                className="flex-1 cursor-pointer"
              >
                <h4 className="font-semibold text-base">{item.title}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  ₹ {item.price}
                </p>
                <p className="text-yellow-500 text-sm">
                  {"★".repeat(Math.round(item.rating))}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() =>
                    onAddToCart({ ...item, image: item.thumbnail })
                  }
                  className="bg-yellow-500 text-white px-4 py-1.5 rounded text-sm hover:bg-[#f39c12] transition"
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => onToggleWishlist(item)}
                  className="text-xl"
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
