import React, { useEffect, useState } from "react";
import { getAuth } from "../../services/global";
import {
  getAllReservations,
  confirmReservation,
  cancelReservation,
} from "../../services/reception";
import "../../css/pendingreserv.css";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";

export default function PendingReservations() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // will be used for both confirm & cancel
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      setLoading(true);

      const data = await getAllReservations({
        statut: "EN_ATTENTE",
        canal: "EN_LIGNE",
      });

      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Error while loading pending reservations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.user.role !== "RECEPTIONNIST") {
      navigate("/login", { replace: true });
      return;
    }
    load();
  }, [navigate]);

  const handleConfirm = async (id) => {
    try {
      setError("");
      setActionLoading({ id, type: "confirm" });

      await confirmReservation(id);

      // remove from list after confirmation
      setRows((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(
        err?.response?.data?.message || "Error while confirming reservation."
      );
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const handleCancel = async (id) => {
    try {
      setError("");
      setActionLoading({ id, type: "cancel" });

      await cancelReservation(id);

      // remove from list after cancel
      setRows((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(
        err?.response?.data?.message || "Error while cancelling reservation."
      );
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  return (
    getAuth() &&
    getAuth().user.role == "RECEPTIONNIST" && (
      <Layout>
        <div className="pending-page">
          <div className="pending-header">
            <h2>Pending Reservations</h2>

            <button className="btn-refresh" onClick={load} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {error && <div className="pending-alert">{error}</div>}

          <div className="pending-card">
            {loading ? (
              <div className="pending-empty">Loading reservations...</div>
            ) : rows.length === 0 ? (
              <div className="pending-empty">No pending online reservations</div>
            ) : (
              <div className="table-wrap">
                <table className="pending-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Phone</th>
                      <th>Room Type</th>
                      <th>Guests</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Status</th>
                      <th className="col-action">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((r) => (
                      <tr key={r._id}>
                        <td className="cell-strong">
                          {r?.client?.nomComplet || "—"}
                        </td>
                        <td>{r?.client?.telephone || "—"}</td>
                        <td>{r?.typeChambre || "—"}</td>
                        <td>{r?.nbPersonnes ?? "—"}</td>

                        <td>
                          {r?.dateArrivee
                            ? new Date(r.dateArrivee).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>
                          {r?.dateDepart
                            ? new Date(r.dateDepart).toLocaleDateString()
                            : "—"}
                        </td>

                        <td>
                          <span className="badge badge-waiting">
                            {r?.statut || "EN_ATTENTE"}
                          </span>
                        </td>

                        <td className="col-action">
                          <div className="action-buttons">
                            <button
                              className="btn-confirm"
                              onClick={() => handleConfirm(r._id)}
                              disabled={actionLoading.id === r._id}
                            >
                              {actionLoading.id === r._id &&
                              actionLoading.type === "confirm"
                                ? "Confirming..."
                                : "Confirm"}
                            </button>

                            <button
                              className="btn-cancel"
                              onClick={() => handleCancel(r._id)}
                              disabled={actionLoading.id === r._id}
                            >
                              {actionLoading.id === r._id &&
                              actionLoading.type === "cancel"
                                ? "Cancelling..."
                                : "Annuler"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && rows.length > 0 && (
              <div className="pending-footer">
                <span>{rows.length} reservation(s) waiting for confirmation</span>
              </div>
            )}
          </div>
        </div>
      </Layout>
    )
  );
}
