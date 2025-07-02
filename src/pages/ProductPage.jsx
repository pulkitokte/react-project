import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import BackButton from "../components/BackButton";
import RecommendedProducts from "../components/RecommendedProducts";
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
  orderBy,
  limit,
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
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState({});
  const [recentViews, setRecentViews] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    axios.get(`https://dummyjson.com/products/${id}`).then((res) => {
      setProduct(res.data);
      setMainImage(res.data.thumbnail);

      // Track recent views
      if (user) saveRecentView(res.data);
    });

    fetchReviews();
    fetchQuestions();
    fetchRecentViews();
  }, [id]);

  const saveRecentView = async (prod) => {
    const viewRef = collection(db, "recentViews");

    const q = query(
      viewRef,
      where("userId", "==", user.uid),
      where("productId", "==", prod.id)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      await addDoc(viewRef, {
        userId: user.uid,
        productId: prod.id,
        timestamp: serverTimestamp(),
        productInfo: {
          title: prod.title,
          thumbnail: prod.thumbnail,
          price: prod.price,
        },
      });
    }
  };

  const fetchRecentViews = async () => {
    if (!user) return;

    const q = query(
      collection(db, "recentViews"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(5)
    );
    const snap = await getDocs(q);
    const data = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item) => item.productId !== Number(id)); // exclude current product
    setRecentViews(data);
  };

  const fetchReviews = async () => {
    const q = query(collection(db, "reviews"), where("productId", "==", id));
    const snapshot = await getDocs(q);
    const fetched = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReviews(fetched);
  };

  const fetchQuestions = async () => {
    const q = query(collection(db, "questions"), where("productId", "==", id));
    const snapshot = await getDocs(q);
    const fetched = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setQuestions(fetched);
  };

  const handleSubmitReview = async () => {
    if (!newRating || !newReview.trim() || !user) return;

    const reviewObj = {
      userId: user.uid,
      userName: user.displayName || user.email,
      rating: newRating,
      comment: newReview.trim(),
      productId: id,
      date: serverTimestamp(),
    };

    try {
      if (editId) {
        await updateDoc(doc(db, "reviews", editId), reviewObj);
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

  const handleAskQuestion = async () => {
    if (!newQuestion.trim() || !user) return;

    const questionObj = {
      productId: id,
      userId: user.uid,
      userName: user.displayName || user.email,
      question: newQuestion.trim(),
      answer: "",
      date: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "questions"), questionObj);
      setNewQuestion("");
      fetchQuestions();
    } catch (err) {
      console.error("Error submitting question:", err);
    }
  };

  const handleAnswerQuestion = async (qid) => {
    if (!newAnswer[qid] || !user) return;

    try {
      await updateDoc(doc(db, "questions", qid), {
        answer: newAnswer[qid],
      });
      setNewAnswer((prev) => ({ ...prev, [qid]: "" }));
      fetchQuestions();
    } catch (err) {
      console.error("Error answering question:", err);
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
      <div style={{ width: "100%", marginBottom: "20px" }}>
        <BackButton />
      </div>

      {/* 🖼️ Image Section */}
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

      {/* 📦 Product Info */}
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

        {/* ⭐ Reviews */}
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
                style={styles.textArea}
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
              <div key={rev.id} style={styles.reviewCard}>
                <p>
                  <strong>• </strong>
                  {rev.date?.seconds
                    ? format(new Date(rev.date.seconds * 1000), "PPP")
                    : "Just now"}
                </p>
                <p style={{ color: "#FFA41C" }}>
                  {"★".repeat(rev.rating)} ({rev.rating}/5)
                </p>
                <p>
                  <em>{rev.userName}</em>
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

          {/* 🟠 Q&A Section */}
          <div style={{ marginTop: "40px" }}>
            <h3>Product Questions & Answers</h3>
            {user && (
              <div style={{ marginBottom: "20px" }}>
                <textarea
                  rows="2"
                  placeholder="Ask a question about this product..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  style={styles.textArea}
                />
                <button onClick={handleAskQuestion} style={styles.btn}>
                  Ask
                </button>
              </div>
            )}
            {questions.map((q) => (
              <div key={q.id} style={styles.reviewCard}>
                <p>
                  <strong>Q:</strong> {q.question}
                </p>
                {q.answer ? (
                  <p>
                    <strong>A:</strong> {q.answer}
                  </p>
                ) : (
                  user && (
                    <div>
                      <input
                        type="text"
                        placeholder="Write an answer..."
                        value={newAnswer[q.id] || ""}
                        onChange={(e) =>
                          setNewAnswer((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        style={{
                          padding: "8px",
                          border: "1px solid #ccc",
                          width: "100%",
                          marginTop: "5px",
                        }}
                      />
                      <button
                        onClick={() => handleAnswerQuestion(q.id)}
                        style={styles.btn}
                      >
                        Answer
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>

          {/* 🟡 Similar Products */}
          <RecommendedProducts
            currentProductId={product.id}
            category={product.category}
            heading="Similar Products"
          />

          {/* 🟣 Recently Viewed Products */}
          {recentViews.length > 0 && (
            <div style={{ marginTop: "40px" }}>
              <h3>Recently Viewed Products</h3>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {recentViews.map((view) => (
                  <div
                    key={view.id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "10px",
                      textAlign: "center",
                      width: "150px",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <img
                      src={view.productInfo.thumbnail}
                      alt={view.productInfo.title}
                      style={{
                        width: "100%",
                        height: "100px",
                        objectFit: "contain",
                      }}
                    />
                    <p style={{ marginTop: "10px", fontSize: "14px" }}>
                      {view.productInfo.title}
                    </p>
                    <p style={{ fontWeight: "bold", color: "#FFA41C" }}>
                      ₹{view.productInfo.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
    marginTop: "40px",
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
  textArea: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "10px",
  },
  reviewCard: {
    background: "#222",
    color: "#fff",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
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
