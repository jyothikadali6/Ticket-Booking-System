
// export default Register;
import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await API.post("/register", {
        email,
        password,
      });

      toast.success("Registration successful 🎉");
      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      
      {/* Outer Card */}
      <div className="w-96 p-8 rounded-2xl shadow-2xl border-t-8 border-red-600 bg-white">
        
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center text-red-600 mb-2">
          Create Account
        </h2>
        <p className="text-center text-green-600 mb-6 font-medium">
          Join us today
        </p>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-600 transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-600 transition"
          />

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300"
          >
            Register
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-sm">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-green-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
