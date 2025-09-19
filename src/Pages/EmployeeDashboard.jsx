import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Employee.css";

const API_BASE = "https://chv-help-backend.vercel.app";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employee] = useState(JSON.parse(localStorage.getItem("currentEmployee")));
  const [files, setFiles] = useState([]);
  const [records, setRecords] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showReason, setShowReason] = useState(false);
  const [pendingAction, setPendingAction] = useState({ recordId: null, status: null, reason: "" });
  const token = localStorage.getItem("employee_token");

  const authHeader = () => (token ? { Authorization: `Bearer ${token}` } : {});

  useEffect(() => {
    async function load() {
      if (!token) {
        navigate("/");
        return;
      }
      const res = await fetch(`${API_BASE}/api/employee/records`, {
        method: "GET",
        headers: { ...authHeader() },
        credentials: "include"
      });
      if (res.ok) {
        const body = await res.json();
        setFiles(body.files || []);
        const rows = (body.records || []).map((r) => ({
          id: r.id,
          file_id: r.file_id,
          filename: r.filename,
          data: r.data || {},
          status: r.status || "",
          reason: r.reason || "",
          updated_at: r.updated_at
        }));
        setRecords(rows);
        if (!activeFile) {
          const first = (body.files || [])[0];
          if (first) setActiveFile({ id: first.id, name: first.filename });
        }
      } else if (res.status === 401 || res.status === 403) {
        navigate("/");
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const rowsForActiveFile = useMemo(() => {
    if (!activeFile) return [];
    return records.filter((r) => r.file_id === activeFile.id);
  }, [records, activeFile]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rowsForActiveFile.filter((r) => {
      const statusOk = statusFilter === "All" ? true : (r.status || "") === statusFilter;
      if (!q) return statusOk;
      const values = Object.values(r.data || {});
      const hit = values.some((v) => String(v).toLowerCase().includes(q));
      return hit && statusOk;
    });
  }, [rowsForActiveFile, search, statusFilter]);

  const columns = useMemo(() => {
    const first = filtered[0];
    if (!first) return [];
    return Object.keys(first.data || {});
  }, [filtered]);

  const stats = useMemo(() => {
    const total = rowsForActiveFile.length;
    const win = rowsForActiveFile.filter((r) => r.status === "Win").length;
    const lose = rowsForActiveFile.filter((r) => r.status === "Lose").length;
    const pending = rowsForActiveFile.filter((r) => r.status === "Pending").length;
    return { total, win, lose, pending };
  }, [rowsForActiveFile]);

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("currentEmployee");
    localStorage.removeItem("employee_token");
    navigate("/");
  };

  const requestStatusChange = (recordId, status) => {
    setPendingAction({ recordId, status, reason: "" });
    setShowReason(true);
  };

  const applyStatus = async () => {
    const { recordId, status, reason } = pendingAction;
    if (!recordId || !status || !reason.trim()) return;
    const res = await fetch(`${API_BASE}/api/employee/records/${recordId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      credentials: "include",
      body: JSON.stringify({ status, reason })
    });
    if (res.ok) {
      const updated = await res.json();
      setRecords((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, status: updated.status, reason: updated.reason, updated_at: updated.updated_at } : r))
      );
      setShowReason(false);
      setPendingAction({ recordId: null, status: null, reason: "" });
    }
  };

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
                  onClick={() => setActiveFile({ id: f.id, name: f.filename })}
                >
                  <div className="e-file-name">{f.filename}</div>
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
              <button className="e-btn" onClick={() => {
                if (!rowsForActiveFile.length) return;
                const cols = [...(columns || []), "status", "reason"];
                const csv = [
                  cols.join(","),
                  ...rowsForActiveFile.map((r) =>
                    cols
                      .map((c) => {
                        const val = c === "status" ? r.status : c === "reason" ? r.reason : r.data?.[c] ?? "";
                        const s = String(val).replace(/"/g, '""');
                        return `"${s}"`;
                      })
                      .join(",")
                  )
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `records_${employee?.username || "me"}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}>Export CSV</button>
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
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      {columns.map((c, j) => (
                        <td key={j}>{String(row.data?.[c] ?? "")}</td>
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
                        <button className="e-btn e-btn-win" onClick={() => requestStatusChange(row.id, "Win")}>Win</button>
                        <button className="e-btn e-btn-lose" onClick={() => requestStatusChange(row.id, "Lose")}>Lose</button>
                        <button className="e-btn e-btn-pending" onClick={() => requestStatusChange(row.id, "Pending")}>Pending</button>
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
