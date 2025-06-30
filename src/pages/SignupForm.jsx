import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return "";
    if (pwd.length < 6) return "Weak";
    if (
      pwd.match(/[a-z]/) &&
      pwd.match(/[A-Z]/) &&
      pwd.match(/[0-9]/) &&
      pwd.length >= 8
    )
      return "Strong";
    return "Medium";
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, { displayName: name });

      localStorage.setItem("username", name);
      localStorage.removeItem("cart");
      localStorage.removeItem("userAddress");
      localStorage.removeItem("orders");

      toast.success("✅ Sign up successful!");
      setTimeout(() => navigate("/login"), 3000);
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

      {/* Password */}
      <div style={styles.passwordField}>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={styles.input}
          onFocus={() => setShowPolicy(true)}
          onBlur={() => setShowPolicy(false)}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          style={styles.toggle}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {showPolicy && (
        <div style={styles.tooltip}>
          🔐 Password must be at least:
          <ul style={{ margin: "5px 0 0 20px", padding: 0 }}>
            <li>8 characters</li>
            <li>1 uppercase letter</li>
            <li>1 number</li>
          </ul>
        </div>
      )}

      {password && (
        <div
          style={{
            ...styles.strength,
            color: strengthColors[passwordStrength],
          }}
        >
          Password Strength: {passwordStrength}
        </div>
      )}

      {/* Confirm Password */}
      <div style={styles.passwordField}>
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
          style={styles.input}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          style={styles.toggle}
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <button type="submit" style={styles.button}>
        Sign Up
      </button>
    </form>
  );
}

const strengthColors = {
  Weak: "red",
  Medium: "#FFA500",
  Strong: "green",
};

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
    width: "100%",
  },
  passwordField: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width:"110%",
  },
  toggle: {
    position: "absolute",
    right: "20px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
  },
  strength: {
    margin: "5px 15px 10px",
    fontWeight: "bold",
  },
  tooltip: {
    fontSize: "14px",
    margin: "5px 10px",
    backgroundColor: "#f0f0f0",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    color: "#333",
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
