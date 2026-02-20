import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "../../services/global";
import {
  getTodayCheckins,
  checkInReservation,
  cancelReservation,
} from "../../services/reception";
import "../../css/todayCheckins.css";
import Layout from "../../components/Layout";

export default function TodayCheckins() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  const auth = getAuth();
  const role = auth?.user.role; // "RECEPTIONNIST" | "ADMIN"
  const canAct = role === "RECEPTIONNIST"; // reception can check-in/cancel

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getTodayCheckins();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Error while loading today check-ins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth) {
      navigate("/login");
      return;
    }
    if (role !== "RECEPTIONNIST" && role !== "ADMIN") {
      navigate("/login");
      return;
    }
    load();
  }, []);

  const handleCheckin = async (id) => {
    if (!canAct) return;
    try {
      setError("");
      setActionLoadingId(id);
      await checkInReservation(id);
      setRows((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Error while performing check-in.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!canAct) return;

    const ok = window.confirm("Cancel this reservation? (Client did not show up)");
    if (!ok) return;

    try {
      setError("");
      setActionLoadingId(id);
      await cancelReservation(id);
      setRows((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Error while cancelling reservation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!auth) {
  navigate("/login", { replace: true });
  return null;
}


  return (
    <Layout>
      <div className="checkins-page">
        <div className="checkins-header">
          <h2>Today Check-ins</h2>

          <button className="btn-refresh" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && <div className="checkins-alert">{error}</div>}

        <div className="checkins-card">
          {loading ? (
            <div className="checkins-empty">Loading reservations...</div>
          ) : rows.length === 0 ? (
            <div className="checkins-empty">No check-ins scheduled for today</div>
          ) : (
            <div className="table-wrap">
              <table className="checkins-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Phone</th>
                    <th>ID</th>
                    <th>Room Type</th>
                    <th>Guests</th>
                    <th>Check-in</th>
                    <th>Status</th>

                    {/* show actions column only for reception */}
                    {canAct && <th className="col-action">Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id}>
                      <td className="cell-strong">{r?.client?.nomComplet || "—"}</td>
                      <td>{r?.client?.telephone || "—"}</td>
                      <td>
                        {(r?.client?.typePiece || "—") +
                          " / " +
                          (r?.client?.numeroPiece || "—")}
                      </td>
                      <td>{r?.typeChambre || "—"}</td>
                      <td>{r?.nbPersonnes ?? "—"}</td>
                      <td>
                        {r?.dateArrivee
                          ? new Date(r.dateArrivee).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        <span className="badge badge-confirmed">
                          {r?.statut || "CONFIRMEE"}
                        </span>
                      </td>

                      {/* actions only for reception */}
                      {canAct && (
                        <td className="col-action">
                          <div className="action-group">
                            <button
                              className="btn-checkin"
                              onClick={() => handleCheckin(r._id)}
                              disabled={actionLoadingId === r._id}
                            >
                              {actionLoadingId === r._id
                                ? "Processing..."
                                : "Check-in"}
                            </button>

                            <button
                              className="btn-cancel"
                              onClick={() => handleCancel(r._id)}
                              disabled={actionLoadingId === r._id}
                            >
                              No-show
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && rows.length > 0 && (
            <div className="checkins-footer">
              <span>{rows.length} reservation(s) to check-in today</span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
