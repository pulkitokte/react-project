import { useNavigate } from "react-router-dom";

const groupedCategories = {
  All: "all",
  Electronics: ["smartphones", "laptops"],
  Fashion: [
    "mens-shirts",
    "mens-shoes",
    "mens-watches",
    "womens-dresses",
    "womens-shoes",
    "womens-watches",
    "womens-bags",
    "womens-jewellery",
  ],
  Beauty: ["fragrances", "skincare"],
  Home: ["home-decoration", "furniture", "lighting"],
  Essentials: ["groceries"],
  Automotive: ["automotive", "motorcycle"],
};


export default function CategoryNavbar({ onSelectCategory }) {
  const navigate = useNavigate();

  const handleClick = (value) => {
    onSelectCategory(value);
    if (value === "all") navigate("/")
  };

  return (
    <div style={styles.container}>
      {Object.entries(groupedCategories).map(([label, value]) => (
        <button
          key={label}
          onClick={() => handleClick(value)}
          style={styles.button}>
          {label}
        </button>
      ))}
    </div>
  );
}

const styles = {
  // In CategoryNavbar.jsx styles
  container: {
    position: "fixed",
    top: "80px", // right below Navbar
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: "#131921",
    padding: "10px",
    display: "flex",
    gap: "15px",
    overflowX: "auto",
    justifyContent: "center",
  },

  button: {
    backgroundColor: "#232F3E",
    color: "white",
    border: "none",
    padding: "8px 16px",
    cursor: "pointer",
    borderRadius: "4px",
    whiteSpace: "nowrap",
    transition: "transform 0.2s ease",
  },
};
