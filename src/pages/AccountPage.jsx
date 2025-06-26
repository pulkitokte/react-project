import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return(
    <div style={styles.container}>
      <h1>My Account</h1>
      {isLoggedIn ? (
        <>
          <h3>Welcome! 🎉</h3>
          <button onClick={handleLogout} style={styles.btn}>
            Sign Out
          </button>
        </>
      ) : (
        <>
          {showLogin ? (
            <>
              <LoginForm onLogin={handleLogin} />
              <p>
                Don't have an account?{" "}
                <button onClick={() => setShowLogin(false)} style={styles.link}>
                  Sign Up
                </button>
              </p>
            </>
          ) : (
            <>
              <SignupForm onSignup={() => setShowLogin(true)} />
              <p>
                Already have an account?{" "}
                <button onClick={() => setShowLogin(true)} style={styles.link}>
                  Log In
                </button>
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "auto",
    padding: "20px",
    border: "1px solid #ccc",
    marginTop: "40px",
    textAlign: "center",
    borderRadius: "8px",
  },
  btn: {
    padding: "8px 16px",
    marginTop: "10px",
    cursor: "pointer",
  },
  link: {
    background: "none",
    border: "none",
    color: "#0073e6",
    cursor: "pointer",
    textDecoration: "underline",
  },
};