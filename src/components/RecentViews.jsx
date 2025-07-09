import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { auth } from "../firebase";
import ProductCard from "./ProductCard";

const db = getFirestore();

export default function RecentViews({ addToCart, toggleFavorite, wishlist }) {
  const [recent, setRecent] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchRecent = async () => {
      if (user) {
        try {
          const q = query(
            collection(db, "recentViews"),
            where("userId", "==", user.uid),
            orderBy("timestamp", "desc"),
            limit(8)
          );
          const snap = await getDocs(q);
          const views = snap.docs.map((doc) => ({
            ...doc.data().productInfo,
            id: doc.data().productId,
          }));
          setRecent(views);
        } catch (err) {
          console.error("Error fetching recent views:", err);
        }
      } else {
        const local = localStorage.getItem("recentViews");
        if (local) {
          try {
            setRecent(JSON.parse(local));
          } catch (err) {
            console.error("Invalid localStorage data for recentViews", err);
          }
        }
      }
    };

    fetchRecent();
  }, [user]);

  if (recent.length === 0) return null;

  return (
    <div className="px-5 mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        👀 Recently Viewed Products
      </h2>
      <div className="flex flex-wrap justify-center gap-6">
        {recent.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
            toggleFavorite={toggleFavorite}
            isFavorite={wishlist.some((w) => w.id === product.id)}
          />
        ))}
      </div>
    </div>
  );
}
