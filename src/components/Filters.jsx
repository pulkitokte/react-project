import React from "react";

export default function Filters({ filters, setFilters, darkMode }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const containerStyle = {
    padding: "20px",
    background: darkMode ? "#1f1f1f" : "#f4f4f4",
    color: darkMode ? "#fff" : "#000",
    borderRadius: "10px",
    width: "260px",
    minHeight: "500px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "bold",
  };

  const selectStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    backgroundColor: darkMode ? "#333" : "#fff",
    color: darkMode ? "#fff" : "#000",
    border: "1px solid #ccc",
    marginBottom: "15px",
  };

  const headingStyle = {
    fontSize: "1.2rem",
    marginBottom: "10px",
    color: darkMode ? "#FFD700" : "#000",
  };

  return (
    <div style={containerStyle}>
      <h3 style={headingStyle}>Filter Products</h3>

      {/* Price Range */}
      <div>
        <label style={labelStyle}>Price Range: ₹{filters.maxPrice}</label>
        <input
          type="range"
          name="maxPrice"
          min="0"
          max="50000"
          step="500"
          value={filters.maxPrice}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "20px" }}
        />
      </div>

      {/* Category */}
      <div>
        <label style={labelStyle}>Category:</label>
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          style={selectStyle}
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
      <div>
        <label style={labelStyle}>Brand:</label>
        <select
          name="brand"
          value={filters.brand}
          onChange={handleChange}
          style={selectStyle}
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
      <div>
        <label style={labelStyle}>Minimum Rating:</label>
        <select
          name="minRating"
          value={filters.minRating}
          onChange={handleChange}
          style={selectStyle}
        >
          <option value="0">All Ratings</option>
          <option value="3">3★ & above</option>
          <option value="4">4★ & above</option>
          <option value="5">5★ only</option>
        </select>
      </div>

      {/* Sort */}
      <h3 style={{ ...headingStyle, marginTop: "20px" }}>Sort By</h3>
      <select
        name="sortBy"
        value={filters.sortBy}
        onChange={handleChange}
        style={selectStyle}
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
