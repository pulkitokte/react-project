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
    <div className="min-h-screen px-4 py-8 bg-white dark:bg-zinc-900 text-black dark:text-white">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        <h1 className="text-2xl font-semibold mb-6 text-center">
          ❤️ My Wishlist
        </h1>

        {wishlist.length === 0 ? (
          <h3 className="text-center text-lg text-gray-600 dark:text-gray-300">
            No Item in Wishlist..
          </h3>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
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

        {/* Recommended Section */}
        {wishlist.length > 0 && lastItemCategory && (
          <div className="mt-10">
            <RecommendedProducts
              currentProductId={lastItem?.id}
              category={lastItemCategory}
              heading="You May Also Like"
              onAddToCart={addToCart}
              onToggleWishlist={toggleFavorite}
              wishlistItems={wishlist}
            />
          </div>
        )}
      </div>
    </div>
  );
}
