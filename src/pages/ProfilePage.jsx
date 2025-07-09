import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { User, ScrollText, Settings, LogOut } from "lucide-react";

const db = getFirestore();

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
        await fetchOrders(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTrackingStatus = async (orderId) => {
    const docRef = doc(db, "tracking", orderId);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data()?.status || {} : {};
  };

  const fetchOrders = async (currentUser) => {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", currentUser.uid)
      );
      const snap = await getDocs(q);
      const orderData = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const order = { id: docSnap.id, ...docSnap.data() };
          const tracking = await fetchTrackingStatus(order.id);
          return { ...order, trackingStatus: tracking };
        })
      );
      setOrders(orderData);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatus = (status = {}) => {
    if (status.delivered) return "Delivered";
    if (status.outForDelivery) return "Out for Delivery";
    if (status.shipped) return "Shipped";
    if (status.ordered) return "Ordered";
    return "Pending";
  };

  const handleLogout = () => {
    auth.signOut().then(() => navigate("/login"));
  };

  if (!user) return <p className="text-center py-10">Loading profile...</p>;

  const { displayName = "Anonymous", email, photoURL } = user;
  const { phone, countryCode, gender, dob, age } = userData || {};

  return (
    <div className="max-w-4xl mx-auto p-10 font-sans">
      <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
        <User size={24} /> My Profile
      </h2>

      <div className="flex gap-6 items-center mb-6">
        <img
          src={photoURL || "https://placehold.co/80x80"}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className="space-y-1">
          <p>
            <strong>Name:</strong> {displayName}
          </p>
          <p>
            <strong>Email:</strong> {email}
          </p>
          <p>
            <strong>Mobile:</strong> {countryCode || ""}{" "}
            {phone || "Not provided"}
          </p>
          <p>
            <strong>Age:</strong> {age || "Not available"}
          </p>
          <p>
            <strong>Gender:</strong> {gender || "Not provided"}
          </p>
          <p>
            <strong>DOB:</strong> {dob || "Not provided"}
          </p>
        </div>
      </div>

      <hr className="my-8 border-gray-300" />

      <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
        <ScrollText size={20} /> My Orders
      </h3>

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders placed yet.</p>
      ) : (
        <ul className="space-y-6">
          {orders.map((order, index) => (
            <li
              key={order.id}
              className="border border-gray-700 bg-gray-900 text-white p-4 rounded-lg"
            >
              <p>
                <strong>Order #{index + 1}</strong>
              </p>
              <p>
                <strong>Placed:</strong>{" "}
                {order.timestamp?.seconds
                  ? new Date(order.timestamp.seconds * 1000).toLocaleString()
                  : new Date(order.timestamp || Date.now()).toLocaleString()}
              </p>
              <p>
                <strong>Name:</strong> {order.name}
              </p>
              <p>
                <strong>Address:</strong> {order.address}
              </p>
              <p>
                <strong>Phone:</strong> {order.phone}
              </p>
              <p>
                <strong>Status:</strong> {getOrderStatus(order.trackingStatus)}
              </p>
              <p className="mt-2 font-semibold">📦 Products:</p>
              <ul className="mt-1 space-y-2">
                {(order.cart || order.items || []).map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div>
                      <p>{item.title}</p>
                      <p className="text-sm text-gray-300">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-2">
                <strong>Total:</strong> ₹{order.totalPrice || order.total}
              </p>
            </li>
          ))}
        </ul>
      )}

      <hr className="my-8 border-gray-300" />

      <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
        <Settings size={20} /> Options
      </h3>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => navigate("/wishlist")}
          className="bg-[#232F3E] text-white px-4 py-2 rounded-md hover:bg-[#1e2a34]"
        >
          ❤️ My Wishlist
        </button>
        <button
          onClick={() => navigate("/address")}
          className="bg-[#232F3E] text-white px-4 py-2 rounded-md hover:bg-[#1e2a34]"
        >
          📦 Manage Address
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
