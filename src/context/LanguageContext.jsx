import { createContext, useContext, useState } from "react";

const translations = {
  en: {
    cart: "Cart",
    wishlist: "Wishlist",
    account: "Account",
    searchPlaceholder: "Search for product...",
  },
  hi: {
    cart: "कार्ट",
    wishlist: "इच्छा सूची",
    account: "खाता",
    searchPlaceholder: "उत्पाद खोजें...",
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
