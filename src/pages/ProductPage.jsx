import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export default function ProductPage({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    axios.get(`https://dummyjson.com/products/${id}`).then((res) => {
      setProduct(res.data);
      setMainImage(res.data.thumbnail); // Default image
    });
  }, [id]);

  if (!product) return <p>Loading...</p>;

  // Simulated multiple images using same one (since fake store has 1 image per product)
  const galleryImages = product.images || [];


  return (
    <div style={styles.page}>
      <div style={styles.imageSection}>
        <Zoom>
          <img src={mainImage} alt={product.title} style={styles.mainImg} />
        </Zoom>

        <div style={styles.thumbnailContainer}>
          {galleryImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="thumb"
              onClick={() => setMainImage(img)}
              style={{
                ...styles.thumb,
                border:
                  mainImage === img ? "2px solid #FFA41C" : "1px solid #ccc",
              }}
            />
          ))}
        </div>
      </div>

      <div style={styles.info}>
        <h2>{product.title}</h2>
        <p>{product.description}</p>
        <p>
          <strong>Brand:</strong> {product.brand}
        </p>
        <p>
          <strong>Category:</strong> {product.category}
        </p>
        <h3>₹ {product.price}</h3>
        <button onClick={() => addToCart(product)} style={styles.btn}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    gap: "40px",
    padding: "40px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  imageSection: {
    maxWidth: "400px",
  },
  mainImg: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
  },
  thumbnailContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    justifyContent: "center",
  },
  thumb: {
    width: "60px",
    height: "60px",
    objectFit: "contain",
    borderRadius: "4px",
    cursor: "pointer",
  },
  info: {
    maxWidth: "500px",
  },
  btn: {
    backgroundColor: "#FFA41C",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
    marginTop: "20px",
  },
};
