import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";


export default function WishlistPage({ wishlist, addToCart, toggleFavorite }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loading />;


  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding: "20px" }}>
      <h1>❤️ My Wishlist</h1>
      {wishlist.length === 0 ? (
        <h3>No Item in Wishlist..</h3>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          {wishlist.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              toggleFavorite={toggleFavorite}
              isFavorite={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
