import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function EmployeeLogin({ users, setAuthUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // ✅ Get employees created by Admin
    const employees = JSON.parse(localStorage.getItem("employees")) || [];
    const found = employees.find(
      (emp) => emp.username === username && emp.password === password
    );

    if (found) {
      // ✅ Save auth state
      const empUser = { ...found, role: "employee" };
      setAuthUser(empUser);

      // ✅ Persist in localStorage
      localStorage.setItem("role", "employee");
      localStorage.setItem("currentEmployee", JSON.stringify(found));

      // ✅ Navigate to employee dashboard
      navigate("/employee");
    } else {
      alert("Invalid Employee credentials ❌");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Employee Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Employee Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Employee Password"
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

export default EmployeeLogin;
