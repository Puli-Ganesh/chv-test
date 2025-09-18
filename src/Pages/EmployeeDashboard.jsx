import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Employee.css";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employee] = useState(JSON.parse(localStorage.getItem("currentEmployee")));
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeFile, setActiveFile] = useState(null);
  const [showReason, setShowReason] = useState(false);
  const [pendingAction, setPendingAction] = useState({ index: null, status: null, reason: "" });

  useEffect(() => {
    const ds = JSON.parse(localStorage.getItem(`excelData_${employee?.username}`)) || [];
    setData(ds);
    setActiveFile(ds.length ? { id: "default", name: "Assigned Dataset" } : null);
  }, [employee?.username]);

  const files = useMemo(() => {
    return activeFile ? [activeFile] : [];
  }, [activeFile]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((row) => {
      const statusOk = statusFilter === "All" ? true : (row.status || "") === statusFilter;
      if (!q) return statusOk;
      return (
        Object.values(row).some((v) => String(v).toLowerCase().includes(q)) && statusOk
      );
    });
  }, [data, search, statusFilter]);

  const stats = useMemo(() => {
    const total = data.length;
    const win = data.filter((r) => r.status === "Win").length;
    const lose = data.filter((r) => r.status === "Lose").length;
    const pending = data.filter((r) => r.status === "Pending").length;
    return { total, win, lose, pending };
  }, [data]);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("currentEmployee");
    navigate("/");
  };

  const requestStatusChange = (index, status) => {
    setPendingAction({ index, status, reason: "" });
    setShowReason(true);
  };

  const applyStatus = () => {
    const { index, status, reason } = pendingAction;
    if (index === null || !status || !reason.trim()) return;
    const updated = [...data];
    updated[index] = { ...updated[index], status, reason };
    setData(updated);
    localStorage.setItem(`excelData_${employee.username}`, JSON.stringify(updated));
    setShowReason(false);
    setPendingAction({ index: null, status: null, reason: "" });
  };

  const exportCsv = () => {
    if (!filtered.length) return;
    const cols = Object.keys(filtered[0]);
    const csv = [
      cols.join(","),
      ...filtered.map((r) =>
        cols
          .map((c) => {
            const val = r[c] ?? "";
            const s = String(val).replace(/"/g, '""');
            return `"${s}"`;
          })
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `records_${employee.username}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo(() => {
    if (!filtered.length) return [];
    const keys = Object.keys(filtered[0]);
    return keys;
  }, [filtered]);

  return (
    <div className="e-wrap">
      <header className="e-topbar">
        <div className="e-brand">Employee Dashboard</div>
        <div className="e-user">
          <div className="e-user-meta">
            <div className="e-user-name">{employee?.username}</div>
            <div className="e-user-role">Employee</div>
          </div>
          <button className="e-btn e-btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="e-main">
        <aside className="e-aside">
          <div className="e-aside-section">
            <div className="e-aside-title">Assigned Files</div>
            <div className="e-file-list">
              {files.length === 0 && <div className="e-empty">No files assigned</div>}
              {files.map((f) => (
                <button
                  key={f.id}
                  className={`e-file ${activeFile?.id === f.id ? "is-active" : ""}`}
                  onClick={() => setActiveFile(f)}
                >
                  <div className="e-file-name">{f.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="e-aside-section">
            <div className="e-aside-title">Overview</div>
            <div className="e-kpis">
              <div className="e-kpi">
                <div className="e-kpi-label">Total</div>
                <div className="e-kpi-value">{stats.total}</div>
              </div>
              <div className="e-kpi">
                <div className="e-kpi-label">Win</div>
                <div className="e-kpi-value">{stats.win}</div>
              </div>
              <div className="e-kpi">
                <div className="e-kpi-label">Lose</div>
                <div className="e-kpi-value">{stats.lose}</div>
              </div>
              <div className="e-kpi">
                <div className="e-kpi-label">Pending</div>
                <div className="e-kpi-value">{stats.pending}</div>
              </div>
            </div>
          </div>
        </aside>

        <section className="e-content">
          <div className="e-toolbar">
            <div className="e-search">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search records"
              />
            </div>
            <div className="e-filters">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>All</option>
                <option>Win</option>
                <option>Lose</option>
                <option>Pending</option>
              </select>
              <button className="e-btn" onClick={exportCsv}>Export CSV</button>
            </div>
          </div>

          <div className="e-table-wrap">
            {!activeFile && <div className="e-empty-full">Select a file to view records</div>}
            {activeFile && filtered.length === 0 && (
              <div className="e-empty-full">No records found</div>
            )}
            {activeFile && filtered.length > 0 && (
              <table className="e-table">
                <thead>
                  <tr>
                    {columns.map((c, i) => (
                      <th key={i}>{c}</th>
                    ))}
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr key={i}>
                      {columns.map((c, j) => (
                        <td key={j}>{String(row[c] ?? "")}</td>
                      ))}
                      <td>
                        <span
                          className={
                            row.status === "Win"
                              ? "e-badge e-badge-win"
                              : row.status === "Lose"
                              ? "e-badge e-badge-lose"
                              : row.status === "Pending"
                              ? "e-badge e-badge-pending"
                              : "e-badge"
                          }
                        >
                          {row.status || "-"}
                        </span>
                      </td>
                      <td className="e-reason">{row.reason || "-"}</td>
                      <td className="e-actions">
                        <button className="e-btn e-btn-win" onClick={() => requestStatusChange(data.indexOf(row), "Win")}>Win</button>
                        <button className="e-btn e-btn-lose" onClick={() => requestStatusChange(data.indexOf(row), "Lose")}>Lose</button>
                        <button className="e-btn e-btn-pending" onClick={() => requestStatusChange(data.indexOf(row), "Pending")}>Pending</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {showReason && (
        <div className="e-modal">
          <div className="e-modal-card">
            <div className="e-modal-head">
              <div className="e-modal-title">Update Status</div>
            </div>
            <div className="e-modal-body">
              <div className="e-modal-row">
                <label>Status</label>
                <input value={pendingAction.status || ""} disabled />
              </div>
              <div className="e-modal-row">
                <label>Reason</label>
                <textarea
                  value={pendingAction.reason}
                  onChange={(e) => setPendingAction((s) => ({ ...s, reason: e.target.value }))}
                  placeholder="Type the reason"
                  rows={4}
                />
              </div>
            </div>
            <div className="e-modal-foot">
              <button className="e-btn e-btn-ghost" onClick={() => setShowReason(false)}>Cancel</button>
              <button className="e-btn" onClick={applyStatus}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboard;
