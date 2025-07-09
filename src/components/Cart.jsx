import { Link } from "react-router-dom";
import { Plus, Minus, Trash2 } from "lucide-react";

export default function Cart({
  cartItems,
  onRemove,
  onIncrease,
  onDecrease,
  darkMode,
}) {
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <p className="text-center text-lg mt-10">
        Cart is empty.{" "}
        <Link to="/" className="text-blue-600 underline">
          Go shopping →
        </Link>
      </p>
    );
  }

  return (
    <div className="w-full">
      {cartItems.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-6 mb-6 p-4 rounded-lg shadow-md ${
            darkMode ? "bg-zinc-800 text-white" : "bg-gray-100 text-black"
          }`}
        >
          <img
            src={item.thumbnail || item.image || item.images?.[0]}
            alt={item.title}
            className="w-24 h-24 object-contain border border-gray-300 p-2 rounded bg-white"
          />
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">{item.title}</h2>
            <p className="text-sm">Price: ₹{item.price.toFixed(2)}</p>
            <p className="text-sm">Quantity: {item.quantity}</p>

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => onIncrease(item.id)}
                className="px-2 py-1 border rounded hover:bg-gray-200 dark:hover:bg-zinc-700"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => onDecrease(item.id)}
                className="px-2 py-1 border rounded hover:bg-gray-200 dark:hover:bg-zinc-700"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="px-2 py-1 border border-red-500 rounded text-red-600 bg-red-100 hover:bg-red-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}

      <h2 className="text-right text-xl font-bold mt-8 mr-4">
        Total: ₹{total.toFixed(2)}
      </h2>

      <div className="flex justify-center mt-6">
        <Link to="/checkout">
          <button className="bg-[#28a745] text-white px-3 py-1.5 rounded hover:bg-green-800 transition duration-200">
            Proceed to Checkout
          </button>
        </Link>
      </div>
    </div>
  );
}
