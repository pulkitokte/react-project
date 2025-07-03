// ✅ Imports and setup remain the same
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { jsPDF } from "jspdf";
import emailjs from "emailjs-com";
import BackButton from "../components/BackButton";

const supportedCountries = [
  { code: "+91", name: "India 🇮🇳" },
  { code: "+1", name: "USA 🇺🇸" },
  { code: "+44", name: "UK 🇬🇧" },
  { code: "+61", name: "Australia 🇦🇺" },
  { code: "+81", name: "Japan 🇯🇵" },
  { code: "+49", name: "Germany 🇩🇪" },
  { code: "+971", name: "UAE 🇦🇪" },
];

export default function CheckoutPage({ cartItems, setCartItems }) {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [sendInvoiceByEmail, setSendInvoiceByEmail] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressLabel, setSelectedAddressLabel] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    countryCode: "+91",
  });
  const [saveAsLabel, setSaveAsLabel] = useState("");

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (user?.uid) {
      const fetchAddresses = async () => {
        const docRef = doc(db, "addresses", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setAddresses(snap.data().addresses || []);
        }
      };
      fetchAddresses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAddressLabel) {
      const addr = addresses.find((a) => a.label === selectedAddressLabel);
      if (addr) setFormData(addr.data);
    }
  }, [selectedAddressLabel]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateInvoiceBase64 = (order) => {
    const doc = new jsPDF();
    doc.text("🧾 Invoice", 90, 10);
    doc.text(`Customer: ${order.name}`, 10, 20);
    doc.text(`Email: ${order.userEmail}`, 10, 30);
    doc.text(`Phone: ${order.phone}`, 10, 40);
    doc.text(`Date: ${new Date(order.timestamp).toLocaleString()}`, 10, 50);
    doc.text("Items:", 10, 60);
    order.cart.forEach((item, i) => {
      const y = 70 + i * 10;
      doc.text(
        `${item.title} × ${item.quantity} = ₹${item.price * item.quantity}`,
        10,
        y
      );
    });
    doc.text(`Total: ₹${order.totalPrice}`, 10, 90 + order.cart.length * 10);
    return doc.output("datauristring");
  };

  const sendInvoiceEmail = async (order, pdfBase64) => {
    const templateParams = {
      to_name: order.name,
      to_email: order.userEmail,
      message: "Thank you for your order! Please find the invoice attached.",
      attachment: pdfBase64,
    };

    try {
      await emailjs.send(
        "service_9z1dno8",
        "template_w7xef0x",
        templateParams,
        "AmaClone"
      );
      toast.success("📧 Invoice emailed!");
    } catch (err) {
      console.error("Email failed:", err);
      toast.error("❌ Failed to send invoice.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!agreedToTerms) {
      toast.error("✅ Please agree to the terms.");
      setLoading(false);
      return;
    }

    const fullPhone = `${formData.countryCode}${formData.phone}`.replace(
      /\s/g,
      ""
    );
    const phoneNumber = parsePhoneNumberFromString(fullPhone);

    if (!phoneNumber || !phoneNumber.isValid()) {
      toast.error("📵 Invalid phone number.");
      setLoading(false);
      return;
    }

    const formattedPhone = phoneNumber.formatInternational();
    const timestamp = Date.now();
    const orderId = `order_${cartItems.length}_${timestamp}`;
    const currentOrder = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      phone: formattedPhone,
      countryCode: formData.countryCode,
      cart: cartItems.map((item) => ({
        ...item,
        image: item.image || item.thumbnail,
      })),
      totalPrice: total,
      timestamp,
      createdAt: new Date().toISOString(),
      userId: user?.uid || null,
      userEmail: user?.email || "Guest",
      orderId,
    };

    try {
      await addDoc(collection(db, "orders"), {
        ...currentOrder,
        createdAt: serverTimestamp(),
      });

      const trackingRef = doc(db, "tracking", orderId);
      await setDoc(trackingRef, {
        status: {
          ordered: true,
          shipped: false,
          outForDelivery: false,
          delivered: false,
        },
        updatedAt: new Date().toLocaleString(),
      });

      // 💾 Save address if labeled
      if (saveAsLabel && user?.uid) {
        const updatedAddresses = [
          ...addresses.filter((a) => a.label !== saveAsLabel),
          { label: saveAsLabel, data: formData },
        ];
        await setDoc(doc(db, "addresses", user.uid), {
          addresses: updatedAddresses,
        });
        setAddresses(updatedAddresses);
        toast.success("📍 Address saved!");
      }

      // 🛒 Clear cart
      setCartItems([]);
      localStorage.removeItem("cart");

      if (sendInvoiceByEmail) {
        const invoicePdf = generateInvoiceBase64(currentOrder);
        await sendInvoiceEmail(currentOrder, invoicePdf);
      }

      toast.success("✅ Order placed!", {
        onClose: () => navigate("/orders"),
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Order failed:", error);
      toast.error("❌ Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", paddingTop: "100px" }}>
      <BackButton />
      <h2>🧾 Checkout</h2>

      {cartItems.length === 0 ? (
        <p>🛒 Your cart is empty.</p>
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ marginBottom: "10px" }}>
                <strong>{item.title}</strong> × {item.quantity} = ₹
                {(item.price * item.quantity).toFixed(2)}
              </div>
            ))}
          </div>

          <h3>Total: ₹{total.toFixed(2)}</h3>

          {addresses.length > 0 && (
            <>
              <label>Select Saved Address: </label>
              <select
                value={selectedAddressLabel}
                onChange={(e) => setSelectedAddressLabel(e.target.value)}
                style={{ ...styles.input, marginBottom: "10px" }}
              >
                <option value="">-- Select Address --</option>
                {addresses.map((addr) => (
                  <option key={addr.label} value={addr.label}>
                    {addr.label}
                  </option>
                ))}
              </select>
            </>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
              required
              style={styles.input}
            />
            <div style={styles.phoneBlock}>
              <select
                value={formData.countryCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    countryCode: e.target.value,
                  }))
                }
                style={styles.countrySelect}
              >
                {supportedCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
                style={styles.phoneInput}
              />
            </div>

            <input
              type="text"
              placeholder="Label this address (e.g. Home, Office)"
              value={saveAsLabel}
              onChange={(e) => setSaveAsLabel(e.target.value)}
              style={styles.input}
            />

            <label style={{ fontSize: "14px" }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              I agree to the {" "}
              <a href="/terms" target="_blank" rel="noreferrer">
                Terms and Conditions
              </a>
            </label>

            <div style={{ margin: "10px 0" }}>
              <label style={{ fontSize: "14px" }}>
                <input
                  type="checkbox"
                  checked={sendInvoiceByEmail}
                  onChange={(e) => setSendInvoiceByEmail(e.target.checked)}
                  style={{ marginRight: "8px" }}
                />
                Email invoice to me
              </label>
            </div>

            <button
              type="submit"
              style={styles.button}
              disabled={loading || !agreedToTerms}
            >
              {loading ? "Placing Order..." : "✅ Place Order"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

const styles = {
  input: {
    display: "block",
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    backgroundColor: "#FFA41C",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  phoneBlock: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  countrySelect: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px 0 0 5px",
    fontSize: "16px",
    outline: "none",
  },
  phoneInput: {
    flex: 1,
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderLeft: "none",
    borderRadius: "0 5px 5px 0",
    outline: "none",
  },
};
