import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";

function AdminDashboard() {
  const [employees, setEmployees] = useState(
    JSON.parse(localStorage.getItem("employees")) || []
  );
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [selectedUser, setSelectedUser] = useState("");
  const [excelData, setExcelData] = useState([]);
  const navigate = useNavigate();

  // ✅ Create new employee
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      alert("Fill all fields ❌");
      return;
    }

    // check duplicate
    if (employees.find((emp) => emp.username === newUser.username)) {
      alert("Employee already exists ❌");
      return;
    }

    const updated = [...employees, newUser];
    setEmployees(updated);
    localStorage.setItem("employees", JSON.stringify(updated));
    setNewUser({ username: "", password: "" });
    alert("Employee created ✅");
  };

  // ✅ Import Excel for a specific employee
  const handleFileUpload = (e) => {
    if (!selectedUser) {
      alert("Please select an employee before uploading ❌");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setExcelData(jsonData);

      // Save per employee → "excelData_<username>"
      localStorage.setItem(
        `excelData_${selectedUser}`,
        JSON.stringify(jsonData)
      );
    };
    reader.readAsArrayBuffer(file);
  };

  // ✅ Load Excel for selected employee
  const handleSelectUser = (username) => {
    setSelectedUser(username);
    const savedData = JSON.parse(localStorage.getItem(`excelData_${username}`)) || [];
    setExcelData(savedData);
  };

  // ✅ Export Excel for selected employee
  const handleExport = () => {
    if (!selectedUser) {
      alert("Please select an employee first ❌");
      return;
    }
    if (excelData.length === 0) {
      alert("No data available to export ❌");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${selectedUser}_data.xlsx`);
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {/* Create Employees */}
      <div className="section">
        <h3>Create Employee</h3>
        <form onSubmit={handleAddUser} className="form-inline">
          <input
            type="text"
            placeholder="Employee Username"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Employee Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            required
          />
          <button type="submit">Add</button>
        </form>

        <ul className="employee-list">
          {employees.map((emp, i) => (
            <li
              key={i}
              style={{
                cursor: "pointer",
                fontWeight: selectedUser === emp.username ? "bold" : "normal",
              }}
              onClick={() => handleSelectUser(emp.username)}
            >
              {emp.username} ({emp.password})
            </li>
          ))}
        </ul>
      </div>

      {/* Excel Import */}
      <div className="section">
        <h3>Import Excel</h3>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </div>

      {/* Excel Data Table */}
      <div className="section">
        <h3>Uploaded Data {selectedUser && `for ${selectedUser}`}</h3>
        {excelData.length === 0 ? (
          <p>No data uploaded yet ❌</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((key, i) => (
                    <th key={i}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleExport}>Export Excel</button>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
