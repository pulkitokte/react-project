import { useNavigate } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar({
  searchTerm,
  setSearchTerm,
  setSelectedCategory,
  darkMode,
  setDarkMode,
}) {
  const navigate = useNavigate();

  // ✅ use language context
  const { language, setLanguage, t } = useLanguage();

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching For...", searchTerm);
  };

  return (
    <header
      style={{
        ...styles.navbar,
        backgroundColor: darkMode ? "#121212" : "#000",
        color: "#fff",
      }}
    >
      <button
        onClick={() => {
          setSelectedCategory("all");
          navigate("/");
        }}
        style={styles.logo}
      >
        <ShoppingCart size={30} color="white" />
        Amazon Clone
      </button>

      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <button className="searchIcon" type="submit" style={styles.searchBtn}>
          <Search size={24} color="white" />
        </button>
      </form>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={styles.dropdown}
      >
        <option value="en">En</option>
        <option value="hi">हिंदी</option>
      </select>

      <div style={styles.navLinks}>
        <button
          onClick={() => navigate("/cart", { state: { showLoader: true } })}
          style={styles.link1}
        >
          {t.cart}
        </button>

        <button onClick={() => navigate("/wishlist")} style={styles.link2}>
          {t.wishlist}
        </button>

        <button
          onClick={() => navigate("/account", { state: { showLoader: true } })}
          style={styles.link1}
        >
          {t.account}
        </button>
        
        <button onClick={() => navigate("/orders")} style={styles.link1}>
          My Orders
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            backgroundColor: darkMode ? "#333" : "#FFA41C",
            color: "#fff",
            border: "none",
            padding: "12px",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
        >
          {darkMode ? "🌙 Dark" : "🔆 Light"}
        </button>
      </div>
    </header>
  );
}

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    backgroundColor: "#000",
    color: "white",
    flexWrap: "wrap",
  },
  logo: {
    fontSize: "1.5rem",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  searchForm: {
    display: "flex",
    flex: 1,
    margin: "0 20px",
    maxWidth: "900px",
  },
  searchInput: {
    flex: 1,
    padding: "15px",
    borderRadius: "4px 0 0 4px",
    border: "none",
    outline: "none",
  },
  searchBtn: {
    padding: "8px 12px",
    border: "none",
    backgroundColor: "#febd69",
    borderRadius: "0 4px 4px 0",
    cursor: "pointer",
  },
  navLinks: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  link1: {
    border: "none",
    backgroundColor: "#febd69",
    color: "white",
    borderRadius: "4px",
    padding: "10px",
    cursor: "pointer",
  },
  link2: {
    border: "none",
    backgroundColor: "#febd69",
    color: "white",
    borderRadius: "4px",
    padding: "10px",
    cursor: "pointer",
  },
  dropdown: {
    width: "70px",
    padding: "6px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#febd69",
    color: "#232F3E",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
