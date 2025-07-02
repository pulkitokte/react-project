import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const saveRecentView = async (userId, product) => {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);

  let views = [];

  if (docSnap.exists()) {
    views = docSnap.data().recentViews || [];

    views = views.filter((p) => p.id !== product.id);
  }

  views.unshift(product);

  if (views.length > 10) views = views.slice(0, 10);

  await setDoc(userRef, { recentViews: views }, { merge: true });
};

export const getRecentViews = async (userId) => {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);

  return docSnap.exists() ? docSnap.data().recentViews || [] : [];
};
