import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import CarouselBanner from "../components/CarouselBanner";
import Loading from "../components/Loading";
import RecentViews from "../components/RecentViews";

export default function Home({
  addToCart,
  searchTerm,
  selectedCategory,
  darkMode,
  wishlist,
  toggleFavorite,
}) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [priceRange, setPriceRange] = useState(2000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [sortOption, setSortOption] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);

  const PRODUCTS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    axios.get("https://dummyjson.com/products?limit=100").then((res) => {
      setAllProducts(res.data.products);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setUsername(storedName);
      const timer = setTimeout(() => {
        setUsername("");
        localStorage.removeItem("username");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedCategory,
    priceRange,
    selectedBrands,
    selectedRating,
    sortOption,
  ]);

  const brands = [...new Set(allProducts.map((p) => p.brand))];

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleRatingChange = (rating) => {
    setSelectedRating(rating === selectedRating ? null : rating);
  };

  const categoryFiltered =
    selectedCategory === "all"
      ? allProducts
      : allProducts.filter((p) =>
          Array.isArray(selectedCategory)
            ? selectedCategory.includes(p.category)
            : p.category === selectedCategory
        );

  const searchFiltered = categoryFiltered.filter((product) =>
    product?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const brandFiltered =
    selectedBrands.length > 0
      ? searchFiltered.filter((p) => selectedBrands.includes(p.brand))
      : searchFiltered;

  const priceFiltered = brandFiltered.filter((p) => p.price <= priceRange);

  const ratingFiltered = selectedRating
    ? priceFiltered.filter((p) => p.rating >= selectedRating)
    : priceFiltered;

  const sortedProducts = [...ratingFiltered].sort((a, b) => {
    switch (sortOption) {
      case "priceLowHigh":
        return a.price - b.price;
      case "priceHighLow":
        return b.price - a.price;
      case "newest":
        return b.id - a.id;
      case "bestsellers":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  if (loading) return <Loading />;

  return (
    <div
      className={`${
        darkMode ? "bg-[#121212] text-white" : "bg-white text-black"
      } min-h-screen`}
    >
      {username && (
        <div className="bg-green-100 text-green-800 py-2 px-4 mx-4 mt-4 rounded text-center font-semibold">
          🎉 Welcome back, <strong>{username}</strong>!
        </div>
      )}

      <CarouselBanner />

      <RecentViews
        addToCart={addToCart}
        toggleFavorite={toggleFavorite}
        wishlist={wishlist}
      />

      <div className="flex flex-wrap gap-6 p-6 justify-center">
        {/* Filters */}
        <div
          className={`min-w-[260px] min-h-[500px] p-5 rounded-lg shadow-md ${
            darkMode ? "bg-[#1f1f1f]" : "bg-gray-100"
          }`}
        >
          {/* Price Filter */}
          <div>
            <label className="font-bold block mb-1">
              Price Range: ₹0 - ₹{priceRange}
            </label>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-yellow-500 mb-4"
            />
          </div>

          {/* Brand Filter */}
          <div className="mt-4">
            <h4 className="font-bold mb-1">Brand</h4>
            {(showAllBrands ? brands : brands.slice(0, 6)).map((brand, i) => (
              <label key={i} className="block text-sm">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                />
                {brand}
              </label>
            ))}
            {brands.length > 6 && (
              <button
                className="text-blue-500 underline mt-2 text-sm"
                onClick={() => setShowAllBrands(!showAllBrands)}
              >
                {showAllBrands ? "View Less ▲" : "View More ▼"}
              </button>
            )}
          </div>

          {/* Rating Filter */}
          <div className="mt-6">
            <h4 className="font-bold mb-1">Rating</h4>
            {[5, 4, 3, 2, 1].map((r) => (
              <label key={r} className="block text-sm">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedRating === r}
                  onChange={() => handleRatingChange(r)}
                />
                {r}★ & above
              </label>
            ))}
          </div>

          {/* Sort By */}
          <div className="mt-6">
            <h4 className="font-bold mb-1">Sort By</h4>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full mt-1 p-2 rounded border"
            >
              <option value="">-- Select --</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="bestsellers">Bestsellers</option>
            </select>
          </div>
        </div>

        {/* Products */}
        <div className="flex flex-wrap justify-center gap-6 flex-1">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              toggleFavorite={toggleFavorite}
              isFavorite={wishlist.some((item) => item.id === product.id)}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="text-center mt-8 pb-8">
        <button
          onClick={() => {
            setCurrentPage((prev) => Math.max(prev - 1, 1));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          disabled={currentPage === 1}
          className={`px-4 py-2 mr-2 rounded ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#febd69] hover:bg-[#f5b041]"
          }`}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentPage(i + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`px-3 py-1 mx-1 rounded ${
              currentPage === i + 1
                ? "bg-yellow-500 font-bold"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => {
            setCurrentPage((prev) => Math.min(prev + 1, totalPages));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 ml-2 rounded ${
            currentPage === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-[#f5b041]"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
