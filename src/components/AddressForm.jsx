import { useState } from "react";

export default function AddressForm({ onSave }) {
  const [name, setName] = useState(localStorage.getItem("username") || "");
  const [email, setEmail] = useState(localStorage.getItem("useremail") || "");
  const [address, setAddress] = useState(localStorage.getItem("address") || "");
  const [phone, setPhone] = useState(localStorage.getItem("phone") || "");
  const [pincode, setPincode] = useState(localStorage.getItem("pincode") || "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    // Save to localStorage
    localStorage.setItem("username", name);
    localStorage.setItem("useremail", email);
    localStorage.setItem("address", address);
    localStorage.setItem("phone", phone);
    localStorage.setItem("pincode", pincode);

    // Clear any error
    setError("");

    // Send data to parent
    onSave({ name, email, address, phone, pincode });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-6 max-w-md mx-auto bg-white rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold text-center">
        Shipping Information
      </h2>

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="p-3 rounded-md border border-gray-300 text-base focus:outline-none focus:ring focus:border-blue-400"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="p-3 rounded-md border border-gray-300 text-base focus:outline-none focus:ring focus:border-blue-400"
      />

      <input
        type="text"
        placeholder="Shipping Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
        className="p-3 rounded-md border border-gray-300 text-base focus:outline-none focus:ring focus:border-blue-400"
      />

      <input
        type="text"
        placeholder="Pincode"
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
        maxLength={6}
        required
        className="p-3 rounded-md border border-gray-300 text-base focus:outline-none focus:ring focus:border-blue-400"
      />

      <input
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        className="p-3 rounded-md border border-gray-300 text-base focus:outline-none focus:ring focus:border-blue-400"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium text-base transition duration-200"
      >
        Save & Continue
      </button>
    </form>
  );
}
