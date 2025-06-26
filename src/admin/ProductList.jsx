import { useState, useEffect } from "react";

export default function ProduuctList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("https://dummyjson.com/products?limit=100")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const deleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div>
      <h2>🛍 All Products</h2>
      {products.map((product) => {
        <div
          key={product.id}
          style={{
            marginBottom: "12px",
            border: "1px solid #ccc",
            padding: "8px",
          }}
        >
          <strong>{product.title}</strong>
          <button
            onClick={() => deleteProduct(product.id)}
            style={{ marginLeft: "10px", color: "red" }}
          >
            Delete
          </button>
        </div>;
      })}
    </div>
  );
}
