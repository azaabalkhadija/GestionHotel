import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "../../services/global";
import { getTodayCheckouts, checkoutReservation } from "../../services/reception";
import "../../css/receptionCheckouts.css";
import Layout from "../../components/Layout";

export default function TodayCheckouts() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const auth = getAuth();
  const role = auth?.user.role;
  const canAct = role === "RECEPTIONNIST";

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getTodayCheckouts();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Error loading today check-outs.");
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
      navigate("/unauthorized");
      return;
    }
    load();
  }, []);

  const handleCheckout = async (id) => {
    if (!canAct) return;

    try {
      setError("");
      setActionId(id);

      const res = await checkoutReservation(id); 
      const factureId = res?.facture?._id || null;

      // update status + factureId
      setRows((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, statut: "TERMINEE", factureId } : r
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Checkout failed.");
    } finally {
      setActionId(null);
    }
  };

  const goToFacture = (r) => {
    if (!r?.factureId) {
      setError("Facture id not found for this reservation. (Need refresh-proof fix below)");
      return;
    }
    navigate(`/reception/factureDetails/${r.factureId}`);
  };

  if (!auth) return null;

  return (
    <Layout>
      <div className="rcout-page">
        <div className="rcout-header">
          <h2>Today Check-outs</h2>
          <button className="rcout-refresh" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && <div className="rcout-alert">{error}</div>}

        <div className="rcout-card">
          {loading ? (
            <div className="rcout-empty">Loading reservations...</div>
          ) : rows.length === 0 ? (
            <div className="rcout-empty">No check-outs scheduled for today</div>
          ) : (
            <div className="rcout-table-wrap">
              <table className="rcout-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Room</th>
                    <th>Guests</th>
                    <th>ID</th>
                    <th>Check-out</th>
                    <th>Status</th>
                    <th className="rcout-action-col">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id}>
                      <td className="rcout-strong">{r?.client?.nomComplet || "—"}</td>
                      <td>
                        {r?.chambreAffectee?.numero || "—"} ({r?.typeChambre || "—"})
                      </td>
                      <td>{r?.nbPersonnes ?? "—"}</td>
                      <td>
                        {(r?.client?.typePiece || "—") + " / " + (r?.client?.numeroPiece || "—")}
                      </td>
                      <td>{r?.dateDepart ? new Date(r.dateDepart).toLocaleDateString() : "—"}</td>
                      <td>
                        <span className="rcout-badge">{r?.statut || "—"}</span>
                      </td>

                      <td className="rcout-action-col">
                        {r?.statut !== "TERMINEE" ? (
                          <button
                            className="rcout-btn"
                            disabled={!canAct || actionId === r._id}
                            onClick={() => handleCheckout(r._id)}
                          >
                            {actionId === r._id ? "Checking out..." : "Check-out"}
                          </button>
                        ) : (
                          <button
                            className="rcout-btn"
                            onClick={() => goToFacture(r)}
                            disabled={!r?.factureId}
                          >
                            Facture
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && rows.length > 0 && (
            <div className="rcout-footer">{rows.length} reservation(s) in today list</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
