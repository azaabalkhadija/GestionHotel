import { getAuth } from "../../services/global";
import { useEffect, useState } from "react";
import "../../css/receptiondash.css";
import Layout from "../../components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { getAllReservations } from "../../services/reception";

function ReceptionDashboard() {
  const navigate = useNavigate();
  const auth = getAuth();

  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [pendingError, setPendingError] = useState("");

  const loadPendingPreview = async () => {
    try {
      setPendingError("");
      setLoadingPending(true);

      const data = await getAllReservations({
        statut: "EN_ATTENTE",
        canal: "EN_LIGNE",
      });

      const list = Array.isArray(data) ? data.slice(0, 3) : [];
      setPending(list);
    } catch (err) {
      setPendingError(err?.response?.data?.message || "Unable to load pending requests.");
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    if (!auth || auth.user.role !== "RECEPTIONNIST") {
      navigate("/login", { replace: true });
      return;
    }
    loadPendingPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return "—";
    }
  };

  if (!auth || auth.user.role !== "RECEPTIONNIST") {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <Layout>
      <div className="rd2-page">
        <div className="rd2-header">
          <div>
            <h2>Welcome back</h2>
            <p className="rd2-subtitle">today’s overview.</p>
          </div>

          <button
            className="rd2-btn rd2-btn-ghost"
            onClick={loadPendingPreview}
            disabled={loadingPending}
          >
            {loadingPending ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="rd2-grid">
          <Link to="/checkins-today" className="rd2-card rd2-linkcard">
            <div className="rd2-card-top">
              <div className="rd2-icon">
                <i className="fa-regular fa-calendar-check"></i>
              </div>
              <div className="rd2-card-title">Today’s Check-ins</div>
            </div>
            <div className="rd2-card-meta">
              <span className="rd2-chip">View list</span>
            </div>
          </Link>

          <Link to="/checkouts-today" className="rd2-card rd2-linkcard">
            <div className="rd2-card-top">
              <div className="rd2-icon">
                <i className="fa-regular fa-calendar-minus"></i>
              </div>
              <div className="rd2-card-title">Today’s Check-outs</div>
            </div>
            <div className="rd2-card-meta">
              <span className="rd2-chip">View list</span>
            </div>
          </Link>

          <Link to="/reception/booking" className="rd2-card rd2-linkcard">
            <div className="rd2-card-top">
              <div className="rd2-icon">
                <i className="fa-regular fa-plus-square"></i>
              </div>
              <div className="rd2-card-title">New Reservation</div>
            </div>
            <div className="rd2-card-meta">
              <span className="rd2-chip">Create</span>
            </div>
          </Link>
        </div>

        <div className="rd2-section">
          <div className="rd2-section-header">
            <h3>Reservation Requests</h3>
            <Link className="rd2-viewall" to="/reception/pending">
              View all →
            </Link>
          </div>

          {pendingError && <div className="rd2-alert">{pendingError}</div>}

          <div className="rd2-card rd2-tablecard">
            {loadingPending ? (
              <div className="rd2-empty">Loading pending requests...</div>
            ) : pending.length === 0 ? (
              <div className="rd2-empty">No pending requests</div>
            ) : (
              <div className="rd2-tablewrap">
                <table className="rd2-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Room Type</th>
                      <th>Guests</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((r) => (
                      <tr key={r._id}>
                        <td className="rd2-strong">{r?.client?.nomComplet || "—"}</td>
                        <td>{r?.typeChambre || "—"}</td>
                        <td>{r?.nbPersonnes ?? "—"}</td>
                        <td>{formatDate(r?.dateArrivee)}</td>
                        <td>{formatDate(r?.dateDepart)}</td>
                        <td>
                          <span className="rd2-badge">{r?.statut || "EN_ATTENTE"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loadingPending && pending.length > 0 && (
              <div className="rd2-footer">
                Showing {pending.length} latest request(s).{" "}
                <Link to="/reception/pending">Open full list</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ReceptionDashboard;
