import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName: name });

      localStorage.setItem("username", name);
      toast.success("✅ Sign up successful!");

      // Navigate to login after short delay
      setTimeout(() => {
        toast.info("Redirecting to login...");
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error("❌ Signup failed: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Sign Up</h2>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        required
        style={styles.input}
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        style={styles.input}
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        style={styles.input}
      />

      <button type="submit" style={styles.button}>
        Sign Up
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "400px",
    margin: "40px auto",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  },
  title: {
    margin: "10px 0",
    textAlign: "center",
    color: "#333",
  },
  input: {
    padding: "10px",
    margin: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    outline: "none",
  },
  button: {
    margin: "20px auto 0",
    padding: "10px 20px",
    width: "50%",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#febd69",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
