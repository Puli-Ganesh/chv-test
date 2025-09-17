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
    { username: "admin", password: "1234", role: "admin" }
  ]);
  const [employeeData, setEmployeeData] = useState({});
  const [authUser, setAuthUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/admin-login"
          element={<AdminLogin users={users} setAuthUser={setAuthUser} />}
        />
        <Route
          path="/employee-login"
          element={<EmployeeLogin users={users} setAuthUser={setAuthUser} />}
        />
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
