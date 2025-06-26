import { Link } from "react-router-dom";
import { Heart, HeartOff, HeartPlus } from "lucide-react";
import "./ProductCardStyle.css";

export default function ProductCard({
  product,
  addToCart,
  toggleFavorite,
  isFavorite,
}) {
  return (
    <div className="product-card" style={styles.card}>
      <img className="thumbnail" src={product.thumbnail} alt={product.title} style={styles.image} />
      <h3>{product.title}</h3>
      <p>₹ {product.price}</p>

      <button className="cart" onClick={() => addToCart(product)} style={styles.btn}>
        Add to Cart
      </button>

      {toggleFavorite && (
        <button
          className="button"
          onClick={() => toggleFavorite(product)}
          style={styles.heart}
        >
          {isFavorite ? (
            <Heart color="red" size={20} fill="red" />
          ) : (
            <HeartPlus color="#444" size={20} />
          )}
        </button>
      )}

      <Link to={`/product/${product.id}`}>
        <button className="view" style={styles.viewBtn}>View Details</button>
      </Link>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    padding: "16px",
    borderRadius: "8px",
    textAlign: "center",
    width: "250px",
    margin: "10px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
  },
  image: {
    height: "150px",
    objectFit: "contain",
    width: "100%",
    marginBottom: "10px",
  },
  btn: {
    backgroundColor: "#FFA41C",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    color: "white",
    marginBottom: "8px",
    cursor: "pointer",
  },
  viewBtn: {
    backgroundColor: "#232F3E",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  heart: {
    margin: "5px",
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "red",
  },
};
