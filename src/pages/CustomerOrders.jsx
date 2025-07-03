import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ScrollText } from "lucide-react";
import Loading from "../components/Loading";
import BackButton from "../components/BackButton";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingStatuses, setTrackingStatuses] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedOrders = [];

      for (const docSnap of querySnapshot.docs) {
        const orderData = docSnap.data();
        const orderId = orderData?.orderId || `order_fallback_${orderData.timestamp}`;
        const trackingDoc = await getDoc(doc(db, "tracking", orderId));

        fetchedOrders.push(orderData);

        if (trackingDoc.exists()) {
          setTrackingStatuses((prev) => ({
            ...prev,
            [orderId]: trackingDoc.data(),
          }));
        } else {
          await setDoc(doc(db, "tracking", orderId), {
            status: {
              ordered: true,
              shipped: false,
              outForDelivery: false,
              delivered: false,
            },
            updatedAt: new Date().toLocaleString(),
          });

          setTrackingStatuses((prev) => ({
            ...prev,
            [orderId]: {
              status: {
                ordered: true,
                shipped: false,
                outForDelivery: false,
                delivered: false,
              },
            },
          }));
        }
      }

      setOrders(fetchedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCancel = (index) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    const updated = [...orders];
    updated.splice(index, 1);
    setOrders(updated);
    toast.info("❌ Order cancelled successfully.");
  };

  const handleReturnRequest = async (orderId, reason) => {
    try {
      const docRef = doc(db, "tracking", orderId);
      await setDoc(
        docRef,
        {
          returnRequest: {
            reason,
            status: "Pending",
            requestedAt: new Date().toISOString(),
          },
        },
        { merge: true }
      );
      toast.success("Return request submitted!");
    } catch (err) {
      console.error("Return request failed", err);
      toast.error("Failed to submit return request.");
    }
  };

  if (loading) return <Loading />;

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#121212",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", marginTop: "40px" }}>
        <BackButton />
      </div>

      <h2
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "30px",
        }}
      >
        <ScrollText size={28} /> My Orders
      </h2>

      {orders.length === 0 ? (
        <p>You haven’t placed any orders yet.</p>
      ) : (
        orders.map((order, index) => {
          const total = order.cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          const orderId = order?.orderId || `order_fallback_${order.timestamp}`;
          const tracking = trackingStatuses[orderId] || {};
          const statusMap = tracking.status || {};
          const isDelivered = statusMap.delivered === true;

          return (
            <div
              key={index}
              style={{
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "25px",
                backgroundColor: "#1e1e1e",
                maxWidth: "600px",
                width: "100%",
              }}
            >
              <h3>Order #{index + 1}</h3>
              <p>
                <strong>Placed on:</strong>{" "}
                {new Date(order.timestamp).toLocaleString()}
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
                <strong>Status:</strong>
              </p>
              <ul style={{ paddingLeft: "20px" }}>
                <li style={{ color: statusMap.ordered ? "lightgreen" : "#888" }}>✅ Ordered</li>
                <li style={{ color: statusMap.shipped ? "lightgreen" : "#888" }}>🚚 Shipped</li>
                <li style={{ color: statusMap.outForDelivery ? "lightgreen" : "#888" }}>📦 Out for Delivery</li>
                <li style={{ color: statusMap.delivered ? "lightgreen" : "#888" }}>📬 Delivered</li>
              </ul>

              <h4 style={{ marginTop: "15px" }}>🛒 Products:</h4>
              {order.cart.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "10px",
                    borderBottom: "1px solid #333",
                    paddingBottom: "10px",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "contain",
                      border: "1px solid #555",
                      padding: "5px",
                      backgroundColor: "#fff",
                      borderRadius: "4px",
                    }}
                  />
                  <div>
                    <p style={{ margin: 0 }}>{item.title}</p>
                    <p style={{ margin: 0 }}>₹ {item.price} × {item.quantity}</p>
                  </div>
                </div>
              ))}

              <h4 style={{ marginTop: "15px" }}>Total: ₹{total.toFixed(2)}</h4>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() => handleCancel(index)}
                  style={{
                    backgroundColor: "#ff4d4f",
                    color: "#fff",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Cancel Order
                </button>

                {isDelivered && (
                  <div style={{ width: "100%" }}>
                    <textarea
                      rows={3}
                      placeholder="Reason for return..."
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                        resize: "vertical",
                        backgroundColor: "#f9f9f9",
                        color: "#000",
                      }}
                      value={tracking.returnReason || ""}
                      onChange={(e) => {
                        const updated = { ...trackingStatuses };
                        updated[orderId] = {
                          ...updated[orderId],
                          returnReason: e.target.value,
                        };
                        setTrackingStatuses(updated);
                      }}
                    ></textarea>

                    <button
                      onClick={() => {
                        const reason = trackingStatuses[orderId]?.returnReason;
                        if (!reason || reason.trim().length === 0) {
                          toast.warning("⚠️ Please enter a reason for return.");
                          return;
                        }
                        handleReturnRequest(orderId, reason.trim());
                      }}
                      style={{
                        backgroundColor: "#FFA41C",
                        color: "#000",
                        border: "none",
                        padding: "10px 15px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginTop: "5px",
                      }}
                    >
                      Submit Return Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
