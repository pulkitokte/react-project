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

  const PRODUCTS_PER_PAGE = 9;
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

  // Reset pagination to first page when filters change
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
      style={{
        backgroundColor: darkMode ? "#121212" : "#fff",
        color: darkMode ? "#fff" : "#000",
        minHeight: "100vh",
      }}
    >
      {username && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "10px 20px",
            margin: "20px",
            borderRadius: "8px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          🎉 Congratulations! You've been logged in, Welcome{" "}
          <strong>{username}</strong>
        </div>
      )}

      <CarouselBanner />

      <RecentViews
        addToCart={addToCart}
        toggleFavorite={toggleFavorite}
        wishlist={wishlist}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "40px",
          padding: "20px",
          justifyContent: "center",
        }}
      >
        {/* Filters */}
        <div
          style={{
            minWidth: "250px",
            minHeight: "500px",
            backgroundColor: darkMode ? "#1e1e1e" : "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          {/* Price */}
          <div>
            <label>
              <strong>Price Range: ₹0 - ₹{priceRange}</strong>
            </label>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: "#febd69",
              }}
            />
          </div>

          {/* Brand */}
          <div style={{ marginTop: "20px" }}>
            <strong>Brand</strong>
            {(showAllBrands ? brands : brands.slice(0, 6)).map((brand, i) => (
              <div key={i}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />{" "}
                  {brand}
                </label>
              </div>
            ))}
            {brands.length > 6 && (
              <button
                onClick={() => setShowAllBrands((prev) => !prev)}
                style={{
                  marginTop: "8px",
                  background: "none",
                  border: "none",
                  color: "#007BFF",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                {showAllBrands ? "View Less ▲" : "View More ▼"}
              </button>
            )}
          </div>

          {/* Rating */}
          <div style={{ marginTop: "20px" }}>
            <strong>Rating</strong>
            {[5, 4, 3, 2, 1].map((r) => (
              <div key={r}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedRating === r}
                    onChange={() => handleRatingChange(r)}
                  />{" "}
                  {r}★ & above
                </label>
              </div>
            ))}
          </div>

          {/* Sort */}
          <div style={{ marginTop: "20px" }}>
            <strong>Sort By:</strong>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                width: "100%",
                marginTop: "8px",
                padding: "6px",
                borderRadius: "4px",
              }}
            >
              <option value="">-- Select --</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="bestsellers">Bestsellers</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div
          className="product-grid"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
            flex: 1,
          }}
        >
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

      {/* Pagination Controls */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <button
          onClick={() => {
            setCurrentPage((prev) => Math.max(prev - 1, 1));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          disabled={currentPage === 1}
          style={{
            padding: "8px 16px",
            marginRight: "10px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            border: "none",
            outline: "none",
          }}
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
            style={{
              padding: "8px 12px",
              margin: "0 5px",
              backgroundColor: currentPage === i + 1 ? "#febd69" : "#e0e0e0",
              fontWeight: currentPage === i + 1 ? "bold" : "normal",
              borderRadius: "4px",
              cursor: "pointer",
              border: "none",
              outline: "none",
            }}
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
          style={{
            padding: "8px 16px",
            marginLeft: "10px",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
