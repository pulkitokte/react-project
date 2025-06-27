import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save displayName (fallback to email username if not available)
      const fallbackName = user.email.split("@")[0];
      localStorage.setItem("username", user.displayName || fallbackName);

      toast.success("🔓 Login successful!");
      navigate("/"); // Redirect after login
    } catch (error) {
      toast.error("❌ Login failed: " + error.message);
    }
  };

  return (
    <form onSubmit={handleLogin} style={styles.form}>
      <h2 style={styles.login}>Login</h2>

      <input
        style={styles.email}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        style={styles.pswd}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button type="submit" style={styles.btn}>
        Login
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
  login: {
    margin: "10px 0",
    textAlign: "center",
    color: "#333",
  },
  email: {
    padding: "10px",
    margin: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    outline: "none",
  },
  pswd: {
    padding: "10px",
    margin: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    outline: "none",
  },
  btn: {
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
