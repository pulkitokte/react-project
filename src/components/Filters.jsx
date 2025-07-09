import React from "react";

export default function Filters({ filters, setFilters, darkMode }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div
      className={`p-5 rounded-xl shadow-md w-[260px] min-h-[500px] ${
        darkMode ? "bg-[#1f1f1f] text-white" : "bg-[#f4f4f4] text-black"
      }`}
    >
      <h3
        className={`text-xl font-semibold mb-4 ${
          darkMode ? "text-yellow-400" : "text-black"
        }`}
      >
        Filter Products
      </h3>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block font-semibold mb-1">
          Price Range: ₹{filters.maxPrice}
        </label>
        <input
          type="range"
          name="maxPrice"
          min="0"
          max="50000"
          step="500"
          value={filters.maxPrice}
          onChange={handleChange}
          className="w-full"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Category:</label>
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className={`w-full p-2 rounded-md border ${
            darkMode
              ? "bg-[#333] text-white border-gray-600"
              : "bg-white border-gray-300"
          }`}
        >
          <option value="all">All</option>
          <option value="smartphones">Smartphones</option>
          <option value="laptops">Laptops</option>
          <option value="fragrances">Fragrances</option>
          <option value="skincare">Skincare</option>
          <option value="groceries">Groceries</option>
          <option value="home-decoration">Home Decoration</option>
        </select>
      </div>

      {/* Brand */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Brand:</label>
        <select
          name="brand"
          value={filters.brand}
          onChange={handleChange}
          className={`w-full p-2 rounded-md border ${
            darkMode
              ? "bg-[#333] text-white border-gray-600"
              : "bg-white border-gray-300"
          }`}
        >
          <option value="all">All</option>
          <option value="Apple">Apple</option>
          <option value="Samsung">Samsung</option>
          <option value="Nike">Nike</option>
          <option value="Chanel">Chanel</option>
          <option value="Gucci">Gucci</option>
          <option value="Huawei">Huawei</option>
        </select>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Minimum Rating:</label>
        <select
          name="minRating"
          value={filters.minRating}
          onChange={handleChange}
          className={`w-full p-2 rounded-md border ${
            darkMode
              ? "bg-[#333] text-white border-gray-600"
              : "bg-white border-gray-300"
          }`}
        >
          <option value="0">All Ratings</option>
          <option value="3">3★ & above</option>
          <option value="4">4★ & above</option>
          <option value="5">5★ only</option>
        </select>
      </div>

      {/* Sort By */}
      <h3
        className={`text-lg font-semibold mt-6 mb-2 ${
          darkMode ? "text-yellow-400" : "text-black"
        }`}
      >
        Sort By
      </h3>
      <select
        name="sortBy"
        value={filters.sortBy}
        onChange={handleChange}
        className={`w-full p-2 rounded-md border ${
          darkMode
            ? "bg-[#333] text-white border-gray-600"
            : "bg-white border-gray-300"
        }`}
      >
        <option value="default">Default</option>
        <option value="priceLowHigh">Price: Low to High</option>
        <option value="priceHighLow">Price: High to Low</option>
        <option value="newest">Newest</option>
        <option value="bestseller">Bestsellers</option>
      </select>
    </div>
  );
}
