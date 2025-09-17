import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import AdminLogin from "./Pages/AdminLogin.jsx";
import EmployeeLogin from "./Pages/EmployeeLogin.jsx";
import Admin from "./Pages/AdminDashboard.jsx";
import Employee from "./Pages/EmployeeDashboard.jsx";
import PrivateRoute from "./Components/PrivateRoute";
import "./App.css";

function App() {
  const [users, setUsers] = useState([
    { username: "admin", password: "1234", role: "admin" }, // default admin
  ]);

  // Store employees per username
  const [employeeData, setEmployeeData] = useState({});
  const [authUser, setAuthUser] = useState(null);

  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Login Pages */}
        <Route
          path="/admin-login"
          element={<AdminLogin users={users} setAuthUser={setAuthUser} />}
        />
        <Route
          path="/employee-login"
          element={<EmployeeLogin users={users} setAuthUser={setAuthUser} />}
        />

        {/* Admin Dashboard (Protected) */}
        <Route
          path="/admin"
          element={
            <PrivateRoute user={authUser} role="admin">
              <Admin
                users={users}
                setUsers={setUsers}
                employeeData={employeeData}
                setEmployeeData={setEmployeeData}
              />
            </PrivateRoute>
          }
        />

        {/* Employee Dashboard (Protected) */}
        <Route
          path="/employee"
          element={
            <PrivateRoute user={authUser} role="employee">
              <Employee
                authUser={authUser}
                employeeData={employeeData}
                setEmployeeData={setEmployeeData}
              />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
