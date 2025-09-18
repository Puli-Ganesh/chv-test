import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const ry = (x / rect.width) * 16;
    const rx = (-y / rect.height) * 16;
    setTilt({ rx, ry });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  return (
    <div className="home-container">
      <div className="bg-blobs">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div
        ref={cardRef}
        className="home-card"
        onMouseMove={handleMove}
        onMouseLeave={resetTilt}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)`,
        }}
      >
        <div className="shine" />
        <h1 className="title">Welcome</h1>
        <p className="subtitle">Select your portal</p>

        <div className="btn-group">
          <button
            className="btn admin-btn"
            onClick={() => navigate("/admin-login")}
          >
            <span className="btn-glow" />
            <span className="btn-text">Admin</span>
          </button>
          <button
            className="btn employee-btn"
            onClick={() => navigate("/employee-login")}
          >
            <span className="btn-glow" />
            <span className="btn-text">Employee</span>
          </button>
        </div>

        <div className="ring ring-1" />
        <div className="ring ring-2" />
        <div className="ring ring-3" />
      </div>
    </div>
  );
}

export default Home;
