import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function EmployeeLogin({ users, setAuthUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    const employees = JSON.parse(localStorage.getItem("employees")) || [];
    if (!employees.find((emp) => emp.username === "test")) {
      const updated = [...employees, { username: "test", password: "1234" }];
      localStorage.setItem("employees", JSON.stringify(updated));
    }
  }, []);

  const handleMove = (e) => {
    const rect = boxRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const ry = (x / rect.width) * 14;
    const rx = (-y / rect.height) * 14;
    setTilt({ rx, ry });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    const employees = JSON.parse(localStorage.getItem("employees")) || [];
    const found = employees.find(
      (emp) => emp.username === username && emp.password === password
    );
    if (found) {
      const empUser = { ...found, role: "employee" };
      setAuthUser(empUser);
      localStorage.setItem("role", "employee");
      localStorage.setItem("currentEmployee", JSON.stringify(found));
      navigate("/employee");
    } else {
      setError("Invalid Employee credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="bg-bursts">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="rings r1" />
      <div className="rings r2" />
      <div className="rings r3" />
      <div
        ref={boxRef}
        className="login-box"
        onMouseMove={handleMove}
        onMouseLeave={resetTilt}
        style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      >
        <div className="shine" />
        <h2 className="login-title">Employee Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="field">
            <input
              type="text"
              placeholder="Employee Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <input
              type="password"
              placeholder="Employee Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn login-btn">
            <span className="btn-glow" />
            <span className="btn-text">Login</span>
          </button>
        </form>
        <div className="decor-dot d1" />
        <div className="decor-dot d2" />
        <div className="decor-dot d3" />
      </div>
    </div>
  );
}

export default EmployeeLogin;
