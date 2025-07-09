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
        <span className="bg-yellow-300 font-bold text-black">
          {text.substring(index, index + searchTerm.length)}
        </span>
        {text.substring(index + searchTerm.length)}
      </>
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex items-center justify-between ${
        darkMode ? "bg-[#121212] text-white" : "bg-black text-white"
      }`}
      style={{ height: "100px" }} 
    >
      {/* Logo */}
      <button
        onClick={() => {
          setSelectedCategory("all");
          navigate("/");
        }}
        className="flex items-center gap-2 font-bold  text-xl"
      >
        <ShoppingCart size={40} />
        <span>AmaClone</span>
      </button>

      {/* Search Bar */}
      <div className="relative w-full max-w-xl flex-1 mx-6">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder={t.searchPlaceholder}
            className="w-full px-4 py-2 text-black rounded-l-md focus:outline-none"
          />
          <button
            type="submit"
            className="bg-yellow-500 px-3 rounded-r-md hover:bg-yellow-600 text-white"
          >
            <Search size={18} />
          </button>
        </form>

        {showSuggestions &&
          searchTerm.trim() &&
          filteredSuggestions.length > 0 && (
            <div className="absolute w-full bg-white shadow-lg rounded mt-1 max-h-60 overflow-y-auto z-50 text-black">
              {filteredSuggestions.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelectSuggestion(p.title)}
                >
                  {highlightMatch(p.title)}
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Right Buttons */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {/* Language */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-yellow-500 text-white px-2 py-2 rounded text-xs focus:outline-none"
        >
          <option value="en">EN</option>
          <option value="hi">हिंदी</option>
        </select>

        {/* Auth */}
        {user ? (
          <>
            <NavBtn label={t.cart} onClick={() => navigate("/cart")} />
            <NavBtn label={t.wishlist} onClick={() => navigate("/wishlist")} />
            <NavBtn label="My Orders" onClick={() => navigate("/orders")} />
            <NavBtn label="My Profile" onClick={() => navigate("/profile")} />
            <NavBtn label="Logout" onClick={handleLogout} />
          </>
        ) : (
          <>
            <NavBtn label="Login" onClick={() => navigate("/login")} />
            <NavBtn label="Sign Up" onClick={() => navigate("/signup")} />
          </>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center gap-1 px-3 py-2 rounded text-white text-sm ${
            darkMode ? "bg-gray-700" : "bg-yellow-500"
          }`}
        >
          {darkMode ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
}

const NavBtn = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1.5 rounded"
  >
    {label}
  </button>
);
