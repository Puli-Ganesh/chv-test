import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function AdminLogin({ users, setAuthUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "1234") {
      const adminUser = { username: "admin", role: "admin" };
      setAuthUser(adminUser);   // ✅ set state so PrivateRoute works
      localStorage.setItem("role", "admin");
      navigate("/admin");
    } else {
      alert("Invalid Admin credentials ❌");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Admin Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
