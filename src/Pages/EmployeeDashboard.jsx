import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Employee.css";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [employee] = useState(
    JSON.parse(localStorage.getItem("currentEmployee"))
  );

  // ✅ Load only this employee's excel data
  useEffect(() => {
    if (employee?.username) {
      const excelData = JSON.parse(
        localStorage.getItem(`excelData_${employee.username}`)
      ) || [];
      setData(excelData);
    }
  }, [employee?.username]);

  // ✅ Handle status update (stored per employee)
  const handleStatusChange = (index, status) => {
    const reason = prompt(`Enter reason for status "${status}":`);
    if (!reason) return;

    const updatedData = [...data];
    updatedData[index] = {
      ...updatedData[index],
      status,
      reason,
    };

    setData(updatedData);
    localStorage.setItem(
      `excelData_${employee.username}`,
      JSON.stringify(updatedData)
    );
    alert("Status updated ✅");
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("currentEmployee");
    navigate("/");
  };

  return (
    <div className="employee-container">
      <div className="employee-header">
        <h2>Welcome, {employee?.username}</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="section">
        <h3>Client Data</h3>
        {data.length === 0 ? (
          <p>No data uploaded by Admin ❌</p>
        ) : (
          <table>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key, i) => (
                  <th key={i}>{key}</th>
                ))}
                <th>Status</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j}>{val}</td>
                  ))}
                  <td>{row.status || "-"}</td>
                  <td>{row.reason || "-"}</td>
                  <td>
                    <button
                      className="win"
                      onClick={() => handleStatusChange(i, "Win")}
                    >
                      Win
                    </button>
                    <button
                      className="lose"
                      onClick={() => handleStatusChange(i, "Lose")}
                    >
                      Lose
                    </button>
                    <button
                      className="pending"
                      onClick={() => handleStatusChange(i, "Pending")}
                    >
                      Pending
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
