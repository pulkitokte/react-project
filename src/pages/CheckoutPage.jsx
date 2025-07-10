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
  getDocs,
} from "firebase/firestore";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { jsPDF } from "jspdf";
import emailjs from "emailjs-com";
import BackButton from "../components/BackButton";
import ApplyCoupon from "../components/ApplyCoupon"; 
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../utils/lang";


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
  const { language } = useLanguage();
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [sendInvoiceByEmail, setSendInvoiceByEmail] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressLabel, setSelectedAddressLabel] = useState("");
  const [useSignupInfo, setUseSignupInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    countryCode: "+91",
    pincode: localStorage.getItem("pincode") || "",
  });
  const [saveAsLabel, setSaveAsLabel] = useState("");

  const [discount, setDiscount] = useState(0); // ✅ Added
  const [appliedCoupon, setAppliedCoupon] = useState(null); // ✅ Added

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
          const saved = snap.data().addresses || [];
          setAddresses(saved);
          if (saved.length > 0) {
            setSelectedAddressLabel(saved[0].label);
            setFormData(saved[0].data);
          }
        }
      };
      fetchAddresses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAddressLabel) {
      const selected = addresses.find((a) => a.label === selectedAddressLabel);
      if (selected) {
        setFormData(selected.data);
      }
    }
  }, [selectedAddressLabel]);

  useEffect(() => {
    const fetchSignupDetails = async () => {
      if (!user?.uid) return;

      if (useSignupInfo) {
        try {
          const [userSnap, addressSnap] = await Promise.all([
            getDoc(doc(db, "users", user.uid)),
            getDocs(collection(db, "users", user.uid, "addresses")),
          ]);

          const userData = userSnap.exists() ? userSnap.data() : {};
          const addressData = !addressSnap.empty
            ? addressSnap.docs[0].data()
            : {};

          setFormData({
            name: userData.displayName || "",
            phone: userData.phone || "",
            countryCode: userData.countryCode || "+91",
            address: addressData.address || "",
          });
        } catch (err) {
          console.error("Error fetching signup info:", err);
          toast.error("❌ Failed to load signup info");
        }
      } else {
        setFormData({
          name: "",
          phone: "",
          address: "",
          countryCode: "+91",
        });
      }
    };

    fetchSignupDetails();
  }, [useSignupInfo, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle coupon removal
  const handleCouponRemove = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    toast.info("Coupon removed");
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
      totalPrice: total - discount, // ✅ Apply discount
      discountAmount: discount,
      appliedCoupon: appliedCoupon?.code || null,
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

      await setDoc(doc(db, "tracking", orderId), {
        status: {
          ordered: true,
          shipped: false,
          outForDelivery: false,
          delivered: false,
        },
        updatedAt: new Date().toLocaleString(),
      });

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
    <div className="px-4 pt-28 pb-10 min-h-screen bg-white dark:bg-zinc-900 text-black dark:text-white">
      <div className="max-w-3xl mx-auto">
        <BackButton />
        <h2 className="text-2xl font-semibold mb-6">🧾 {t.checkout}</h2>

        {cartItems.length === 0 ? (
          <p className="text-lg">🛒 {t.yourCartEmpty}</p>
        ) : (
          <>
            <div className="mb-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 mb-4 p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg"
                >
                  <img
                    src={item.image || item.thumbnail}
                    alt={item.title}
                    className="w-20 h-20 object-contain rounded bg-white"
                  />
                  <div>
                    <a
                      href={`/product/${item.id}`}
                      className="font-semibold text-yellow-500 hover:underline"
                    >
                      {item.title}
                    </a>
                    <p className="text-sm">
                      Quantity: <strong>{item.quantity}</strong>
                    </p>
                    <p className="text-sm">
                      Subtotal: ₹
                      <strong>{(item.price * item.quantity).toFixed(2)}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <ApplyCoupon
              onApply={(coupon) => {
                if (!coupon) {
                  // Just update state without toast — avoid duplicate
                  setDiscount(0);
                  setAppliedCoupon(null);
                  return;
                }

                let discountAmount = 0;
                if (coupon.discountType === "fixed") {
                  discountAmount = coupon.discountValue;
                } else if (coupon.discountType === "percentage") {
                  discountAmount = (total * coupon.discountValue) / 100;
                }

                setDiscount(discountAmount);
                setAppliedCoupon(coupon);
                toast.success(`🎉 Coupon "${coupon.code}" applied!`);
              }}
            />

            <h3 className="text-xl font-medium mb-4">
              {t.total}: ₹{(total - discount).toFixed(2)}
              {appliedCoupon && (
                <span className="block text-sm text-green-500">
                  ({appliedCoupon.code} applied: -₹{discount.toFixed(2)}){" "}
                  <button
                    onClick={handleCouponRemove}
                    className="ml-2 text-red-500 underline text-xs"
                  >
                    Remove
                  </button>
                </span>
              )}
            </h3>

            <div className="mb-4">
              <label className="text-sm">
                <input
                  type="checkbox"
                  checked={useSignupInfo}
                  onChange={(e) => setUseSignupInfo(e.target.checked)}
                  className="mr-2"
                />
                {t.useSavedInfo}
              </label>
            </div>

            {addresses.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm mb-1">
                  {t.selectSavedAddress}
                </label>
                <select
                  value={selectedAddressLabel}
                  onChange={(e) => setSelectedAddressLabel(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {addresses.map((addr) => (
                    <option key={addr.label} value={addr.label}>
                      {addr.label} — {addr.data.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
                maxLength={6}
                pattern="\d{6}"
                required
                className="w-full p-2 border roundedl"
              />
              <div className="flex gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      countryCode: e.target.value,
                    }))
                  }
                  className="p-2 border rounded w-1/3"
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
                  className="flex-1 p-2 border rounded"
                />
              </div>
              <input
                type="text"
                placeholder={t.addressLabel}
                value={saveAsLabel}
                onChange={(e) => setSaveAsLabel(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <label className="text-sm">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mr-2"
                />
                {t.agreeTerms}{" "}
                <a
                  href="/terms"
                  className="text-blue-500 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.termsLink}
                </a>
              </label>
              <label className="text-sm block">
                <input
                  type="checkbox"
                  checked={sendInvoiceByEmail}
                  onChange={(e) => setSendInvoiceByEmail(e.target.checked)}
                  className="mr-2"
                />
                {t.emailInvoice}
              </label>
              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded disabled:opacity-50"
              >
                {loading ? t.placingOrder : t.placeOrder}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
