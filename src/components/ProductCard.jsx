import { Link } from "react-router-dom";
import { Heart, HeartPlus } from "lucide-react";

export default function ProductCard({
  product,
  addToCart,
  toggleFavorite,
  isFavorite,
}) {
  const imageSrc =
    product.thumbnail || product.image || "https://via.placeholder.com/150";
  const title = product.title || "No Title";
  const price = product.price !== undefined ? product.price : "N/A";

  return (
    <div className="border border-gray-200 rounded-lg p-4 w-[250px] text-center m-2 shadow hover:shadow-lg hover:scale-105 transition-transform duration-300 bg-white">
      <img
        src={imageSrc}
        alt={title}
        className="h-[150px] w-full object-contain mb-3"
      />
      <h3 className="font-medium text-lg mb-1">{title}</h3>
      <p className="text-gray-800 font-semibold mb-3">₹ {price}</p>

      {/* 🛒 Add to Cart */}
      <button
        onClick={() => addToCart(product)}
        className="bg-yellow-500 text-black px-4 py-2 rounded hover:opacity-90 font-semibold w-full mb-2"
      >
        Add to Cart
      </button>

      {/* ❤️ Wishlist Button */}
      <button
        onClick={() => toggleFavorite(product)}
        className="text-red-500 hover:scale-110 transition mb-2"
      >
        {isFavorite ? <Heart size={20} fill="red" /> : <HeartPlus size={20} />}
      </button>

      {/* 🔍 View Details Button */}
      <Link to={`/product/${product.id}`}>
        <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition w-full mt-2">
          View Details
        </button>
      </Link>
    </div>
  );
}
