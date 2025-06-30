import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import BackButton from "../components/BackButton";
import { auth } from "../firebase";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { format } from "date-fns";

const db = getFirestore();

export default function ProductPage({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [editId, setEditId] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    axios.get(`https://dummyjson.com/products/${id}`).then((res) => {
      setProduct(res.data);
      setMainImage(res.data.thumbnail);
    });

    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    const q = query(collection(db, "reviews"), where("productId", "==", id));
    const snapshot = await getDocs(q);
    const fetched = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReviews(fetched);
  };

  const handleSubmitReview = async () => {
    if (!newRating || !newReview.trim() || !user) return;

    const reviewObj = {
      userId: user.uid,
      userName: user.displayName || user.email,
      rating: newRating,
      comment: newReview.trim(),
      productId: id,
      date: serverTimestamp(), // ✅ fixed
    };

    try {
      if (editId) {
        const reviewRef = doc(db, "reviews", editId);
        await updateDoc(reviewRef, reviewObj);
      } else {
        await addDoc(collection(db, "reviews"), reviewObj);
      }
      setNewRating(0);
      setNewReview("");
      setEditId(null);
      fetchReviews();
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  const handleEditReview = (rev) => {
    setNewRating(rev.rating);
    setNewReview(rev.comment);
    setEditId(rev.id);
  };

  const handleDeleteReview = async (id) => {
    try {
      await deleteDoc(doc(db, "reviews", id));
      fetchReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  if (!product) return <p>Loading...</p>;

  return (
    <div style={styles.page}>
      <div style={{ width: "100%" }}>
        <BackButton />
      </div>

      <div style={styles.imageSection}>
        <Zoom>
          <img src={mainImage} alt={product.title} style={styles.mainImg} />
        </Zoom>
        <div style={styles.thumbnailContainer}>
          {product.images?.map((img, i) => (
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
        <button
          onClick={() => addToCart({ ...product, image: product.thumbnail })}
          style={styles.btn}
        >
          Add to Cart
        </button>

        {/* ⭐ Reviews Section */}
        <div style={{ marginTop: "40px" }}>
          <h3>Customer Reviews</h3>
          {averageRating && (
            <p>
              ⭐ {averageRating} / 5 ({reviews.length} reviews)
            </p>
          )}

          {user && (
            <>
              <div style={{ margin: "10px 0" }}>
                <label>Rating: </label>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setNewRating(star)}
                    style={{
                      cursor: "pointer",
                      color: star <= newRating ? "#FFA41C" : "#ccc",
                      fontSize: "20px",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                rows="3"
                placeholder="Write your review..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                }}
              />
              <button onClick={handleSubmitReview} style={styles.btn}>
                {editId ? "Update Review" : "Submit Review"}
              </button>
            </>
          )}

          <hr style={{ margin: "20px 0" }} />

          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  background: "#222",
                  color: "#fff",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                <p style={{ fontWeight: "bold", marginBottom: "6px" }}>
                  •{" "}
                  {rev.date?.seconds
                    ? format(new Date(rev.date.seconds * 1000), "PPP")
                    : "Just now"}
                </p>
                <p style={{ color: "#FFA41C" }}>
                  {"★".repeat(rev.rating)} ({rev.rating}/5)
                </p>
                <p style={{ fontStyle: "italic", marginBottom: "4px" }}>
                  {rev.userName}
                </p>
                <p>{rev.comment}</p>

                {user?.uid === rev.userId && (
                  <div style={{ marginTop: "8px" }}>
                    <button
                      onClick={() => handleEditReview(rev)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      style={styles.delBtn}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
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
    flexWrap: "wrap",
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
    marginTop: "10px",
  },
  editBtn: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "6px 12px",
    marginRight: "10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  delBtn: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
