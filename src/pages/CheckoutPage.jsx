import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { jsPDF } from "jspdf";
import emailjs from "emailjs-com";
import BackButton from "../components/BackButton";

// 🌍 Supported countries
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

  const savedAddress = JSON.parse(localStorage.getItem("userAddress")) || {
    name: "",
    address: "",
    phone: "",
    countryCode: "+91",
  };

  const [formData, setFormData] = useState(savedAddress);
  const [useSaved, setUseSaved] = useState(!!savedAddress.name);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseSavedToggle = () => {
    if (!useSaved) {
      setFormData(savedAddress);
    } else {
      setFormData({ name: "", address: "", phone: "", countryCode: "+91" });
    }
    setUseSaved(!useSaved);
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
        "service_9z1dno8", // Replace
        "template_w7xef0x", // Replace
        templateParams,
        "AmaClone" // Replace
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
      toast.error("✅ Please agree to the terms before placing the order.");
      setLoading(false);
      return;
    }

    const fullPhone = `${formData.countryCode}${formData.phone}`.replace(
      /\s/g,
      ""
    );
    const phoneNumber = parsePhoneNumberFromString(fullPhone);

    if (!phoneNumber || !phoneNumber.isValid()) {
      toast.error("📵 Invalid phone number for selected country.");
      setLoading(false);
      return;
    }

    const formattedPhone = phoneNumber.formatInternational();

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
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      userId: user?.uid || null,
      userEmail: user?.email || "Guest",
    };

    try {
      await addDoc(collection(db, "orders"), {
        ...currentOrder,
        createdAt: serverTimestamp(),
      });

      localStorage.setItem(
        "orders",
        JSON.stringify([
          ...(JSON.parse(localStorage.getItem("orders")) || []),
          currentOrder,
        ])
      );
      localStorage.setItem("userAddress", JSON.stringify(currentOrder));
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

          {savedAddress.name && (
            <button
              onClick={handleUseSavedToggle}
              style={{
                ...styles.button,
                backgroundColor: useSaved ? "#bbb" : "#FFA41C",
                marginBottom: "10px",
              }}
            >
              {useSaved ? "✏️ Use New Address" : "📦 Use Saved Address"}
            </button>
          )}

          <form onSubmit={handleSubmit}>
            <h4>Shipping Details</h4>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={styles.input}
              disabled={useSaved}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
              required
              style={styles.input}
              disabled={useSaved}
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
                disabled={useSaved}
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
                disabled={useSaved}
              />
            </div>

            <label style={{ fontSize: "14px" }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              I agree to the{" "}
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

            {loading && (
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <div className="loader"></div>
                <p>Processing your order...</p>
              </div>
            )}
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
