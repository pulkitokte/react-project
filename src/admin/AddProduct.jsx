import { useState } from "react";

export default function AppProduct() {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    
    const handleAdd = () => {
        const newProduct = { title, price };
        console.log("Added", newProduct)  
    };

    return (
      <div>
        <h2>➕ Add New Product</h2>
        <input
          type="text"
          placeholder="Product Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <br />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <br />
        <br />
        <button onClick={handleAdd}>Add Product</button>
      </div>
    );
}