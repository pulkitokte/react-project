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

  useEffect(() => {
    axios.get("https://dummyjson.com/products?limit=100").then((res) => {
      setAllProducts(res.data.products);
      setLoading(false);
    });
  }, []);

  const categoryFiltered =
    selectedCategory === "all"
      ? allProducts
      : allProducts.filter((p) => Array.isArray(selectedCategory)? selectedCategory.includes(p.category):p.category === selectedCategory );

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
        marginTop: "120px",
      }}
    >
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
