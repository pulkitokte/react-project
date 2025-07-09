// same imports
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
      .filter((item) => item.productId !== Number(id));
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

  if (!product) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="flex flex-wrap justify-center gap-10 p-10 mt-10">
      <div className="w-full mb-5">
        <BackButton />
      </div>

      {/* 🖼️ Image Section */}
      <div className="max-w-md">
        <Zoom>
          <img src={mainImage} alt={product.title} className="rounded-lg" />
        </Zoom>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {product.images?.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="thumb"
              onClick={() => setMainImage(img)}
              className={`w-14 h-14 object-contain rounded cursor-pointer border ${
                mainImage === img ? "border-yellow-500" : "border-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 📦 Product Info */}
      <div className="max-w-lg space-y-4">
        <h2 className="text-2xl font-bold">{product.title}</h2>
        <p>{product.description}</p>
        <p className="text-sm text-gray-500">
          <strong>Brand:</strong> {product.brand}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Category:</strong> {product.category}
        </p>
        <h3 className="text-xl font-semibold text-yellow-500">
          ₹{product.price}
        </h3>
        <button
          onClick={() => addToCart({ ...product, image: product.thumbnail })}
          className="bg-yellow-500 text-white py-2 px-4 rounded mt-2"
        >
          Add to Cart
        </button>

        {/* ⭐ Reviews */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">Customer Reviews</h3>
          {averageRating && (
            <p className="mb-2 text-sm text-yellow-500">
              ⭐ {averageRating} / 5 ({reviews.length} reviews)
            </p>
          )}
          {user && (
            <div>
              <label className="block mb-2">Rating:</label>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setNewRating(star)}
                  className={`text-2xl cursor-pointer ${
                    star <= newRating ? "text-yellow-500" : "text-gray-400"
                  }`}
                >
                  ★
                </span>
              ))}
              <textarea
                rows="3"
                placeholder="Write your review..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded mt-3 mb-2"
              />
              <button
                onClick={handleSubmitReview}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                {editId ? "Update Review" : "Submit Review"}
              </button>
            </div>
          )}

          <hr className="my-5" />

          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-gray-800 text-white p-4 rounded mb-4"
              >
                <p className="text-xs">
                  <strong>• </strong>
                  {rev.date?.seconds
                    ? format(new Date(rev.date.seconds * 1000), "PPP")
                    : "Just now"}
                </p>
                <p className="text-yellow-400">
                  {"★".repeat(rev.rating)} ({rev.rating}/5)
                </p>
                <p className="italic text-sm">{rev.userName}</p>
                <p>{rev.comment}</p>
                {user?.uid === rev.userId && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleEditReview(rev)}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {/* 🟠 Q&A */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-2">
              Product Questions & Answers
            </h3>
            {user && (
              <div className="mb-5">
                <textarea
                  rows="2"
                  placeholder="Ask a question..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded mb-2"
                />
                <button
                  onClick={handleAskQuestion}
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Ask
                </button>
              </div>
            )}
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-gray-800 text-white p-4 rounded mb-3"
              >
                <p>
                  <strong>Q:</strong> {q.question}
                </p>
                {q.answer ? (
                  <p>
                    <strong>A:</strong> {q.answer}
                  </p>
                ) : (
                  user && (
                    <div className="mt-2">
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
                        className="w-full p-2 border border-gray-300 rounded mb-2"
                      />
                      <button
                        onClick={() => handleAnswerQuestion(q.id)}
                        className="bg-yellow-500 text-white px-4 py-1 rounded"
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

          {/* 🟣 Recently Viewed */}
          {recentViews.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold mb-3">
                Recently Viewed Products
              </h3>
              <div className="flex flex-wrap gap-4">
                {recentViews.map((view) => (
                  <div
                    key={view.id}
                    className="border border-gray-200 rounded p-3 text-center w-36 bg-gray-50"
                  >
                    <img
                      src={view.productInfo.thumbnail}
                      alt={view.productInfo.title}
                      className="w-full h-24 object-contain"
                    />
                    <p className="mt-2 text-sm">{view.productInfo.title}</p>
                    <p className="font-bold text-yellow-500">
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
