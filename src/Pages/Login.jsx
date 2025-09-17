import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ users, setAuthUser }) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Find matching user from App.js users state
    const user = users.find(
  (u) =>
    u.username.trim().toLowerCase() === credentials.username.trim().toLowerCase() &&
    u.password === credentials.password
);


    if (user) {
      setAuthUser(user);
      setError("");

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "employee") {
        navigate("/employee");
      }
    } else {
      setError("Invalid credentials! Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            placeholder="Enter Username"
            value={credentials.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn">
            Login
          </button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default Login;
