import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
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

  const strengthColors = {
    Weak: "text-red-500",
    Medium: "text-orange-500",
    Strong: "text-green-600",
  };

  const isValidDOB = (dateStr) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateStr)) return false;
    const [day, month, year] = dateStr.split("/").map(Number);
    const date = new Date(`${year}-${month}-${day}`);
    return (
      date &&
      date.getFullYear() === year &&
      date.getMonth() + 1 === month &&
      date.getDate() === day
    );
  };

  const calculateAge = (dobStr) => {
    const [day, month, year] = dobStr.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidDOB(dob)) {
      toast.error("❌ Please enter a valid DOB in DD/MM/YYYY format.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match!");
      return;
    }

    if (phone.length !== 10) {
      toast.error("❌ Mobile number must be exactly 10 digits.");
      return;
    }

    if (!gender || !dob) {
      toast.error("❌ Please fill in all fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const age = calculateAge(dob);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name,
        email,
        phone,
        countryCode,
        gender,
        age,
        dob,
      });

      if (address.trim()) {
        await addDoc(collection(db, "users", user.uid, "addresses"), {
          name,
          address,
          phone,
          countryCode,
          label: "Home",
          createdAt: serverTimestamp(),
        });
      }

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
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg space-y-4"
    >
      <h2 className="text-2xl font-bold text-center mb-2">Sign Up</h2>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        required
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
      />

      <div className="flex items-center gap-2">
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="+91">+91 (India)</option>
          <option value="+1">+1 (USA)</option>
          <option value="+44">+44 (UK)</option>
        </select>
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            const input = e.target.value;
            if (/^\d{0,10}$/.test(input)) setPhone(input);
          }}
          placeholder="Mobile Number"
          required
          className="flex-1 px-4 py-2 border rounded focus:outline-none"
        />
      </div>

      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded focus:outline-none"
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <input
        type="text"
        value={dob}
        onChange={(e) => {
          const input = e.target.value;
          if (/^\d{0,2}\/?\d{0,2}\/?\d{0,4}$/.test(input)) setDob(input);
        }}
        placeholder="DD/MM/YYYY"
        required
        className="w-full px-4 py-2 border rounded focus:outline-none"
      />

      <input
        type="text"
        placeholder="Address (optional)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full px-4 py-2 border rounded focus:outline-none"
      />

      {/* Password */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          onFocus={() => setShowPolicy(true)}
          onBlur={() => setShowPolicy(false)}
          className="w-full px-4 py-2 border rounded focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-2.5 text-gray-500"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {showPolicy && (
        <div className="text-sm bg-gray-100 border p-3 rounded text-gray-700">
          🔐 Password must be at least:
          <ul className="ml-5 list-disc">
            <li>8 characters</li>
            <li>1 uppercase letter</li>
            <li>1 number</li>
          </ul>
        </div>
      )}

      {password && (
        <div
          className={`text-sm font-medium ${strengthColors[passwordStrength]}`}
        >
          Password Strength: {passwordStrength}
        </div>
      )}

      {/* Confirm Password */}
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
          className="w-full px-4 py-2 border rounded focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          className="absolute right-3 top-2.5 text-gray-500"
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-500 transition duration-200"
      >
        Sign Up
      </button>
    </form>
  );
}
