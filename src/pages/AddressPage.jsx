import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    countryCode: "+91",
    label: "Home",
  });
  const [isEditing, setIsEditing] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        await fetchAddresses(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAddresses = async (uid) => {
    const snapshot = await getDocs(collection(db, "users", uid, "addresses"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setAddresses(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (isEditing) {
        const docRef = doc(db, "users", user.uid, "addresses", isEditing);
        await updateDoc(docRef, formData);
      } else {
        const newDoc = doc(db, "users", user.uid, "addresses", formData.label);
        await setDoc(newDoc, formData);
      }
      await fetchAddresses(user.uid);
      setFormData({
        name: "",
        address: "",
        phone: "",
        countryCode: "+91",
        label: "Home",
      });
      setIsEditing(null);
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleEdit = (addr) => {
    setFormData(addr);
    setIsEditing(addr.label);
  };

  const handleDelete = async (label) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "addresses", label));
      await fetchAddresses(user.uid);
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  return (
    <div className="p-5 pt-20 max-w-2xl mx-auto font-sans">
      <BackButton />
      <h2 className="text-2xl font-semibold mb-6">🏠 Manage Addresses</h2>

      {addresses.length === 0 ? (
        <p className="text-gray-600">No saved addresses yet.</p>
      ) : (
        <ul className="space-y-4 mb-8">
          {addresses.map((addr) => (
            <li
              key={addr.label}
              className="border border-gray-300 p-4 rounded-lg bg-white shadow-sm"
            >
              <p className="font-semibold text-lg">{addr.label}</p>
              <p>{addr.name}</p>
              <p>{addr.address}</p>
              <p>
                {addr.countryCode} {addr.phone}
              </p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => handleEdit(addr)}
                  className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.label)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 className="text-xl font-medium mb-4">
        {isEditing !== null ? "✏️ Edit Address" : "➕ Add New Address"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="text"
          name="label"
          placeholder="Label (e.g. Home, Office)"
          value={formData.label}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
        />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
        />
        <div className="flex gap-4">
          <select
            name="countryCode"
            value={formData.countryCode}
            onChange={handleInputChange}
            className="w-1/3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
          >
            <option value="+91">🇮🇳 +91</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+61">🇦🇺 +61</option>
          </select>
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-2/3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
        >
          {isEditing !== null ? "💾 Update" : "➕ Save"}
        </button>
      </form>
    </div>
  );
}
 