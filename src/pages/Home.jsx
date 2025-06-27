import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import CarouselBanner from "../components/CarouselBanner";
import Loading from "../components/Loading";

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

      // Optional: Clear the welcome message after 5 seconds
      const timer = setTimeout(() => {
        setUsername("");
        localStorage.removeItem("username");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const categoryFiltered =
    selectedCategory === "all"
      ? allProducts
      : allProducts.filter((p) =>
          Array.isArray(selectedCategory)
            ? selectedCategory.includes(p.category)
            : p.category === selectedCategory
        );

  const filteredProducts = categoryFiltered.filter((product) =>
    product?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div
      style={{
        backgroundColor: darkMode ? "#121212" : "#fff",
        color: darkMode ? "#fff" : "#000",
        minHeight: "100vh",
        //marginTop: "120px",
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

      <div
        className="product-grid"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        {filteredProducts.map((product) => (
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
  );
}
