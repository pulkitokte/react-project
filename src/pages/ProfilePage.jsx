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

  if (!user) return <p>Loading profile...</p>;

  const { displayName = "Anonymous", email, photoURL } = user;
  const { phone, countryCode, gender, dob, age } = userData || {};

  return (
    <div style={styles.container}>
      <h2>
        <User size={24} /> My Profile
      </h2>

      <div style={styles.section}>
        <img
          src={photoURL || "https://placehold.co/80x80"}
          alt="Profile"
          style={styles.avatar}
        />
        <div>
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

      <hr style={{ margin: "20px 0" }} />

      <h3>
        <ScrollText size={20} /> My Orders
      </h3>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        <ul style={styles.orderList}>
          {orders.map((order, index) => (
            <li key={order.id} style={styles.orderItem}>
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
              <p>
                <strong>📦 Products:</strong>
              </p>
              <ul>
                {(order.cart || order.items || []).map((item, i) => (
                  <li key={i} style={styles.productItem}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={styles.productImage}
                    />
                    <div>
                      <p>{item.title}</p>
                      <p>
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p>
                <strong>Total:</strong> ₹{order.totalPrice || order.total}
              </p>
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h3>
        <Settings size={20} /> Options
      </h3>

      <div style={styles.options}>
        <button onClick={() => navigate("/wishlist")} style={styles.optionBtn}>
          ❤️ My Wishlist
        </button>
        <button onClick={() => navigate("/address")} style={styles.optionBtn}>
          📦 Manage Address
        </button>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "800px",
    margin: "auto",
    fontFamily: "sans-serif",
  },
  section: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  orderList: {
    listStyle: "none",
    padding: 0,
  },
  orderItem: {
    border: "1px solid #ccc",
    padding: "15px",
    borderRadius: "6px",
    marginBottom: "20px",
    backgroundColor: "#111",
    color: "#fff",
  },
  productItem: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
  },
  productImage: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "6px",
  },
  options: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  optionBtn: {
    backgroundColor: "#232F3E",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  logoutBtn: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
};
