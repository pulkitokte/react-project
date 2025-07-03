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
    <div style={{ padding: "20px", paddingTop: "80px" }}>
      <BackButton />
      <h2>🏠 Manage Addresses</h2>

      {addresses.length === 0 ? (
        <p>No saved addresses yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {addresses.map((addr) => (
            <li
              key={addr.label}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <p>
                <strong>{addr.label}</strong>
              </p>
              <p>{addr.name}</p>
              <p>{addr.address}</p>
              <p>
                {addr.countryCode} {addr.phone}
              </p>
              <button onClick={() => handleEdit(addr)} style={styles.editBtn}>
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(addr.label)}
                style={styles.deleteBtn}
              >
                🗑️ Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3>{isEditing !== null ? "✏️ Edit Address" : "➕ Add New Address"}</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
        <input
          type="text"
          name="label"
          placeholder="Label (e.g. Home, Office)"
          value={formData.label}
          onChange={handleInputChange}
          required
          style={styles.input}
        />
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
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            name="countryCode"
            value={formData.countryCode}
            onChange={handleInputChange}
            style={styles.input}
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
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.saveBtn}>
          {isEditing !== null ? "💾 Update" : "➕ Save"}
        </button>
      </form>
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
  editBtn: {
    marginRight: "10px",
    backgroundColor: "#FFC107",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer",
  },
  deleteBtn: {
    backgroundColor: "#DC3545",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer",
  },
  saveBtn: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
