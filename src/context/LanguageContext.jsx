import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    searchPlaceholder: "Search for products...",
    cart: "Cart",
    wishlist: "Wishlist",
    myOrders: "My Orders",
    myProfile: "My Profile",
    logout: "Logout",
    login: "Login",
    signup: "Sign Up",
  },
  hi: {
    searchPlaceholder: "उत्पाद खोजें...",
    cart: "कार्ट",
    wishlist: "इच्छा सूची",
    myOrders: "मेरे ऑर्डर",
    myProfile: "मेरी प्रोफाइल",
    logout: "लॉग आउट",
    login: "लॉगिन",
    signup: "साइन अप",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang) setLanguage(savedLang);
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = translations[language] || translations["en"];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
