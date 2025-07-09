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
    if (value === "all") navigate("/");
  };

  return (
    <div className="fixed top-[100px] left-0 right-0 z-40 bg-[#131921] py-2 px-4 flex gap-3 overflow-x-auto justify-center shadow-md">
      {Object.entries(groupedCategories).map(([label, value]) => (
        <button
          key={label}
          onClick={() => handleClick(value)}
          className="bg-[#232F3E] text-white px-4 py-2 rounded hover:bg-yellow-500 transition-all whitespace-nowrap text-sm font-medium"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
