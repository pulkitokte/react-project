import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";


export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // ✅ Save displayName (or fallback to email before "@") in localStorage
      const fallbackName = user.email.split("@")[0];
      localStorage.setItem("username", user.displayName || fallbackName);

      toast.success("🔓 Login successful!");
      onLogin(); // Navigate or update auth state
    } catch (error) {
      toast.error("❌ Login failed: " + error.message);
    }
  };

  return (
    <form onSubmit={handleLogin} style={styles.form}>
      <h2 style={styles.login}>Login</h2>
      <input
        style={styles.email}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        style={styles.pswd}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
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
  btn: {
    margin: "10px",
    marginLeft: "100px",
    padding: "8px 0px",
    width: "50%",
    borderRadius: "3px",
    border: "none",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  pswd: {
    padding: "8px",
    margin: "10px",
    border: "none",
    outline: "none",
    borderRadius: "5px",
  },
  email: {
    padding: "8px",
    margin: "10px",
    border: "none",
    outline: "none",
    borderRadius: "5px",
  },
  login: {
    margin: "5px",
  },
};