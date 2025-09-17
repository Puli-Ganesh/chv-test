import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-card">
        
        <p>Select your portal</p>
        <div className="btn-group">
          <button className="btn admin-btn" onClick={() => navigate("/admin-login")}>
            Admin
          </button>
          <button className="btn employee-btn" onClick={() => navigate("/employee-login")}>
            Employee
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
