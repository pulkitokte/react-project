import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { ShoppingCart, Search, Sun, Moon } from "lucide-react";
import { auth } from "../firebase";
import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";

export default function Navbar({
  searchTerm,
  setSearchTerm,
  setSelectedCategory,
  darkMode,
  setDarkMode,
  user,
  products = [],
}) {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleLogout = () => {
    signOut(auth);
    localStorage.removeItem("username");
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching For...", searchTerm);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (title) => {
    setSearchTerm(title);
    setShowSuggestions(false);
  };

  const filteredSuggestions = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const highlightMatch = (text) => {
    const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1 || searchTerm === "") return text;

    return (
      <>
        {text.substring(0, index)}
        <span
          style={{
            fontWeight: "bold",
            backgroundColor: "yellow",
            color: "#000",
          }}
        >
          {text.substring(index, index + searchTerm.length)}
        </span>
        {text.substring(index + searchTerm.length)}
      </>
    );
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

      <div style={{ position: "relative", flex: 1, maxWidth: "50%" }}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}>
            <Search size={24} color="white" />
          </button>
        </form>

        {showSuggestions &&
          searchTerm.trim() &&
          filteredSuggestions.length > 0 && (
            <div style={styles.suggestionBox}>
              {filteredSuggestions.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  style={styles.suggestionItem}
                  onClick={() => handleSelectSuggestion(p.title)}
                >
                  {highlightMatch(p.title)}
                </div>
              ))}
            </div>
          )}
      </div>

      <div style={styles.navLinks}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={styles.dropdown}
        >
          <option value="en">En</option>
          <option value="hi">हिंदी</option>
        </select>

        {user ? (
          <>
            <button onClick={() => navigate("/cart")} style={styles.link1}>
              {t.cart}
            </button>
            <button onClick={() => navigate("/wishlist")} style={styles.link1}>
              {t.wishlist}
            </button>
            <button onClick={() => navigate("/orders")} style={styles.link1}>
              My Orders
            </button>
            <button onClick={handleLogout} style={styles.link1}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/login")} style={styles.link1}>
              Login
            </button>
            <button onClick={() => navigate("/signup")} style={styles.link1}>
              Sign Up
            </button>
          </>
        )}

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: darkMode ? "#333" : "#FFA41C",
            color: "#fff",
            border: "none",
            padding: "8px",
            borderRadius: "6px",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          {darkMode ? <Moon size={18} /> : <Sun size={18} />}
          {darkMode ? "Dark" : "Light"}
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
    width: "100%",
    zIndex: 100,
    height: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
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
  },
  searchInput: {
    width: "100%",
    padding: "15px",
    borderRadius: "4px 0 0 4px",
    border: "none",
    outline: "none",
    fontSize: "16px",
  },
  searchBtn: {
    padding: "0 16px",
    backgroundColor: "#a46600",
    border: "none",
    borderRadius: "0 4px 4px 0",
    cursor: "pointer",
  },
  suggestionBox: {
    position: "absolute",
    top: "100%",
    width: "100%",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderTop: "none",
    maxHeight: "200px",
    overflowY: "auto",
    zIndex: 999,
  },
  suggestionItem: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  },
  navLinks: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  link1: {
    border: "none",
    backgroundColor: "#a46600",
    color: "white",
    borderRadius: "4px",
    padding: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  dropdown: {
    width: "60px",
    padding: "9px",
    borderRadius: "4px",
    border: "none",
    outline: "none",
    backgroundColor: "#a46600",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
