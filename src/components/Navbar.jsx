import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { ShoppingCart, Search, Sun, Moon } from "lucide-react";
import { auth } from "../firebase";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar({
  searchTerm,
  user, // ✅ receive from parent
  setSearchTerm,
  setSelectedCategory,
  darkMode,
  setDarkMode,
}) {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = () => {
    signOut(auth);
    localStorage.removeItem("username");
    navigate("/");
  };

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
        <button type="submit" style={styles.searchBtn}>
          <Search size={24} color="white" />
        </button>
      </form>

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
            // height: "40px",
            //margin: "0 6px",
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
    //border: "2px solid red",
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
    maxWidth: "50%",
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
    fontWeight: "bold",
  },
  dropdown: {
    width: "60px",
    padding: "9px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#febd69",
    color: "#232F3E",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
