import { useLanguage } from "../context/LanguageContext";

export default function Language() {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ padding: "20px" }}>
      <h2>Select Language</h2>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "16px",
          borderRadius: "6px",
          backgroundColor: "#febd69",
          color: "#232f3e",
        }}
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
      </select>
    </div>
  );
}
