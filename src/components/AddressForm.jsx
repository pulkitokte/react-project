import { useState } from "react";

export default function AddressForm({ onSave }) {
    const [name, setName] = useState(localStorage.getItem("username") || "");
    const [email, setEmail] = useState(localStorage.getItem("useremail") || "");
    const [address, setAddress] = useState(localStorage.getItem("address") || "");
    const [phone, setPhone] = useState(localStorage.getItem("phone") || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Save to localStorage
        localStorage.setItem("username", name);
        localStorage.setItem("useremail", email);
        localStorage.setItem("address", address);
        localStorage.setItem("phone", phone);

        // Call the onSave callback with the address data
        onSave({
            name,
            email,
            address,
            phone
        });
    };
    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h2>Shipping Information</h2>
            <input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
            />
            <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
            />
            <input
                placeholder="Shipping Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                style={styles.input}
            />
            <input
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={styles.input}
            />
            <button type="submit" style={styles.button}>Save & Continue</button>
        </form>
    );
}

const styles = {
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "20px",
        maxWidth: "400px",
        margin: "0 auto",   
    },
    input: {
        padding: "10px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        fontSize: "16px",
    },
    button:{
        padding:"12px",
        backgroundColor:"FFA41C",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
    }
}
