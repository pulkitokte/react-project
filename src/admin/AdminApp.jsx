import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./Dashboard";
import ProductList from "./ProductList";
import AddProduct from "./AddProduct";

export default function AdminApp() {
  return (
    <div style={styles.container}>
      <nav style={styles.sidebar}>
        <h2>🛠️ Admin Panel</h2>
        <Link to="/admin">Dashboard</Link>
        <br />
        <Link to="/admin/products">Products</Link>
        <br />
        <Link to="/admin/add-product">Add Product</Link>
      </nav>
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="add-product" element={<AddProduct />} />
        </Routes>
      </main>
    </div>
  );
}
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
  },
  sidebar: {
    width: "200px",
    backgroungColor: "#232F3E",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
  },
  main: {
    flex: 1,
    padding: "20px",
  },
};
