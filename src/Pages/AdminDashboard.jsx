import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";

const API_BASE = "https://chv-help-backend.vercel.app";

function AdminDashboard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [selectedUser, setSelectedUser] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);

  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 1600);
  };

  const authHeader = () => {
    const t = localStorage.getItem("admin_token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  async function fetchEmployees() {
    const res = await fetch(`${API_BASE}/api/admin/employees`, {
      method: "GET",
      credentials: "include",
      headers: { ...authHeader() }
    });
    if (res.ok) {
      const body = await res.json();
      setEmployees(body.employees || []);
    } else if (res.status === 401 || res.status === 403) {
      notify("Please login as admin");
      navigate("/admin-login");
    } else {
      notify("Failed to load employees");
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => e.username.toLowerCase().includes(q));
  }, [employees, search]);

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const assignedCount = 0;
    const totalRows = excelData.length;
    return { totalEmployees, assignedCount, totalRows };
  }, [employees, excelData]);

  async function handleAddUser(e) {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return notify("Enter username and password");
    const res = await fetch(`${API_BASE}/api/admin/employees`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(newUser)
    });
    if (res.ok) {
      setNewUser({ username: "", password: "" });
      notify("Employee created");
      fetchEmployees();
    } else if (res.status === 401 || res.status === 403) {
      notify("Please login as admin");
      navigate("/admin-login");
    } else {
      const err = await res.json().catch(() => ({}));
      notify(err.error || "Failed to create");
    }
  }

  function handleSelectUser(u) {
    setSelectedUser(u);
    setExcelData([]);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onChooseFile(e) {
    const file = e.target.files?.[0] || null;
    setPendingFile(file);
  }

  async function allocateFile() {
    if (!selectedUser) return notify("Select an employee");
    if (!pendingFile) return notify("Choose a file");
    const fd = new FormData();
    fd.append("file", pendingFile);
    fd.append("employeeId", selectedUser);
    const res = await fetch(`${API_BASE}/api/admin/files/upload`, {
      method: "POST",
      credentials: "include",
      headers: { ...authHeader() },
      body: fd
    });
    if (res.ok) {
      notify("Allocated to employee");
      const buf = await pendingFile.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);
      setExcelData(json);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else if (res.status === 401 || res.status === 403) {
      notify("Please login as admin");
      navigate("/admin-login");
    } else {
      const err = await res.json().catch(() => ({}));
      notify(err.error || "Allocation failed");
    }
  }

  function exportCSV() {
    if (!selectedUser || excelData.length === 0) return notify("No data to export");
    const cols = Object.keys(excelData[0]);
    const csv = [
      cols.join(","),
      ...excelData.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedUser}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify("CSV exported");
  }

  function exportXLSX() {
    if (!selectedUser || excelData.length === 0) return notify("No data to export");
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${selectedUser}_data.xlsx`);
    notify("Excel exported");
  }

  function clearEmployeeData() {
    setExcelData([]);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    notify("Cleared");
  }

  function handleLogout() {
    fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" }).finally(() => {
      localStorage.removeItem("admin_token");
      navigate("/");
    });
  }

  return (
    <div className="a-wrap">
      <header className="a-topbar">
        <div className="a-brand">Admin Console</div>
        <div className="a-actions">
          <button className="a-btn a-btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="a-main">
        <aside className="a-aside">
          <div className="a-card a-card-kpis">
            <div className="a-kpi">
              <div className="a-kpi-label">Employees</div>
              <div className="a-kpi-value">{stats.totalEmployees}</div>
            </div>
            <div className="a-kpi">
              <div className="a-kpi-label">With Data</div>
              <div className="a-kpi-value">{stats.assignedCount}</div>
            </div>
            <div className="a-kpi">
              <div className="a-kpi-label">Total Rows</div>
              <div className="a-kpi-value">{stats.totalRows}</div>
            </div>
          </div>
          <div className="a-card">
            <div className="a-card-title">Create Employee</div>
            <form className="a-form" onSubmit={handleAddUser}>
              <input
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser((s) => ({ ...s, username: e.target.value }))}
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))}
              />
              <button className="a-btn a-btn-primary" type="submit">Add</button>
            </form>
          </div>
          <div className="a-card">
            <div className="a-card-title">Employees</div>
            <div className="a-search">
              <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="a-list">
              {filteredEmployees.length === 0 && <div className="a-empty">No results</div>}
              {filteredEmployees.map((emp) => (
                <button
                  key={emp.id}
                  className={`a-list-item ${selectedUser === emp.id ? "is-active" : ""}`}
                  onClick={() => handleSelectUser(emp.id)}
                >
                  <div className="a-list-name">{emp.username}</div>
                  <div className="a-list-meta">{emp.role}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>
        <section className="a-content">
          <div className="a-card">
            <div className="a-card-head">
              <div className="a-card-title">Allocate File</div>
              <div className="a-head-actions">
                <button className="a-btn a-btn-ghost" onClick={clearEmployeeData}>Clear</button>
                <button className="a-btn" onClick={exportCSV}>Export CSV</button>
                <button className="a-btn a-btn-accent" onClick={exportXLSX}>Export Excel</button>
              </div>
            </div>
            <div className="a-alloc">
              <div className="a-alloc-row">
                <div className="a-label">Selected</div>
                <div className="a-value">
                  {selectedUser ? employees.find((e) => e.id === selectedUser)?.username || selectedUser : "-"}
                </div>
              </div>
              <label className="a-file">
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={onChooseFile} />
                <span>Choose Excel</span>
              </label>
            </div>
            <div className="a-alloc" style={{ marginTop: 10 }}>
              <div className="a-alloc-row">
                <div className="a-label">File</div>
                <div className="a-value">{pendingFile ? pendingFile.name : "-"}</div>
              </div>
              <button
                className="a-btn"
                onClick={allocateFile}
                disabled={!selectedUser || !pendingFile}
              >
                Allocate
              </button>
            </div>
          </div>
          <div className="a-card">
            <div className="a-card-title">Uploaded Data {selectedUser ? "· preview" : ""}</div>
            <div className="a-table-wrap">
              {!selectedUser && <div className="a-empty-full">Select an employee to upload</div>}
              {selectedUser && excelData.length === 0 && <div className="a-empty-full">No data preview</div>}
              {selectedUser && excelData.length > 0 && (
                <table className="a-table">
                  <thead>
                    <tr>
                      {Object.keys(excelData[0]).map((k) => (
                        <th key={k}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((row, i) => (
                      <tr key={i}>
                        {Object.keys(excelData[0]).map((k) => (
                          <td key={k}>{String(row[k] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </main>
      {toast && <div className="a-toast">{toast}</div>}
    </div>
  );
}

export default AdminDashboard;
