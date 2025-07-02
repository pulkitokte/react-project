import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

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
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("addresses")) || [];
    setAddresses(stored);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedAddresses = [...addresses];

    if (isEditing !== null) {
      updatedAddresses[isEditing] = formData;
    } else {
      updatedAddresses.push(formData);
    }

    localStorage.setItem("addresses", JSON.stringify(updatedAddresses));
    setAddresses(updatedAddresses);
    setFormData({
      name: "",
      address: "",
      phone: "",
      countryCode: "+91",
      label: "Home",
    });
    setIsEditing(null);
  };

  const handleEdit = (index) => {
    setFormData(addresses[index]);
    setIsEditing(index);
  };

  const handleDelete = (index) => {
    const updated = addresses.filter((_, i) => i !== index);
    localStorage.setItem("addresses", JSON.stringify(updated));
    setAddresses(updated);
  };

  return (
    <div style={{ padding: "20px", paddingTop: "80px" }}>
      <BackButton />
      <h2>🏠 Manage Addresses</h2>

      {addresses.length === 0 ? (
        <p>No saved addresses yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {addresses.map((addr, i) => (
            <li
              key={i}
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
              <button onClick={() => handleEdit(i)} style={styles.editBtn}>
                ✏️ Edit
              </button>
              <button onClick={() => handleDelete(i)} style={styles.deleteBtn}>
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
