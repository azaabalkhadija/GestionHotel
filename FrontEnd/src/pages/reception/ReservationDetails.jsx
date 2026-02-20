import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { getAuth } from "../../services/global";
import { getReservationById } from "../../services/reception";
import "../../css/reservationDetails.css";

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function ReservationDetails() {
  const { id } = useParams(); // reservation id
  const navigate = useNavigate();

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (!auth) return navigate("/login");
    if (auth.user.role !== "RECEPTIONNIST" && auth.user.role !== "ADMIN") return navigate("/login");
  }, [navigate]);

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getReservationById(id);
      setRow(data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Error loading reservation details.");
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  return (
    <Layout>
      <div className="rrd-page">
        <div className="rrd-header">
          <div>
            <h2>Reservation Details</h2>
            <p>Reservation ID: <span className="rrd-mono">{id}</span></p>
          </div>

          <div className="rrd-header-actions">
            <button className="rrd-btn rrd-btn-ghost" onClick={load} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>

            <Link to="/reservations" className="rrd-btn rrd-btn-primary">
              ← Back to list
            </Link>
          </div>
        </div>

        {error && <div className="rrd-alert">{error}</div>}

        <div className="rrd-card">
          {loading ? (
            <div className="rrd-empty">Loading reservation...</div>
          ) : !row ? (
            <div className="rrd-empty">Reservation not found.</div>
          ) : (
            <>
              {/* Top summary */}
              <div className="rrd-top">
                <div className="rrd-top-left">
                  <div className="rrd-kpi">
                    <div className="rrd-kpi-label">Reservation #</div>
                    <div className="rrd-kpi-value">{row?.numeroReservation || "—"}</div>
                  </div>

                  <div className="rrd-kpi">
                    <div className="rrd-kpi-label">Status</div>
                    <div className="rrd-kpi-value">
                      <span className={`rrd-badge rrd-badge-${(row?.statut || "").toLowerCase()}`}>
                        {row?.statut || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="rrd-kpi">
                    <div className="rrd-kpi-label">Channel</div>
                    <div className="rrd-kpi-value">{row?.canal || "—"}</div>
                  </div>
                </div>

                <div className="rrd-top-right">
                  <div className="rrd-mini">
                    <div className="rrd-mini-label">Check-in</div>
                    <div className="rrd-mini-value">{fmtDate(row?.dateArrivee)}</div>
                  </div>
                  <div className="rrd-mini">
                    <div className="rrd-mini-label">Check-out</div>
                    <div className="rrd-mini-value">{fmtDate(row?.dateDepart)}</div>
                  </div>
                  <div className="rrd-mini">
                    <div className="rrd-mini-label">Guests</div>
                    <div className="rrd-mini-value">{row?.nbPersonnes ?? "—"}</div>
                  </div>
                </div>
              </div>

              <div className="rrd-divider" />

              {/* Details grid */}
              <div className="rrd-grid">
                {/* Client card */}
                <div className="rrd-section">
                  <div className="rrd-section-title">Client</div>

                  <div className="rrd-pair">
                    <span className="rrd-key">Full name</span>
                    <span className="rrd-val">{row?.client?.nomComplet || "—"}</span>
                  </div>

                  <div className="rrd-pair">
                    <span className="rrd-key">Phone</span>
                    <span className="rrd-val">{row?.client?.telephone || "—"}</span>
                  </div>

                  <div className="rrd-pair">
                    <span className="rrd-key">Email</span>
                    <span className="rrd-val">{row?.client?.email || "—"}</span>
                  </div>

                  <div className="rrd-pair">
                    <span className="rrd-key">ID</span>
                    <span className="rrd-val">
                      {(row?.client?.typePiece || "—") + " / " + (row?.client?.numeroPiece || "—")}
                    </span>
                  </div>
                </div>

                {/* Reservation card */}
                <div className="rrd-section">
                  <div className="rrd-section-title">Reservation</div>

                  <div className="rrd-pair">
                    <span className="rrd-key">Room type</span>
                    <span className="rrd-val">{row?.typeChambre || "—"}</span>
                  </div>

                  <div className="rrd-pair">
                    <span className="rrd-key">Created</span>
                    <span className="rrd-val">{fmtDate(row?.createdAt)}</span>
                  </div>

                  <div className="rrd-pair">
                    <span className="rrd-key">Updated</span>
                    <span className="rrd-val">{fmtDate(row?.updatedAt)}</span>
                  </div>

                  <div className="rrd-pair">
                    <span className="rrd-key">Reservation ID</span>
                    <span className="rrd-val rrd-mono">{row?._id}</span>
                  </div>
                </div>

                {/* Room card */}
                <div className="rrd-section rrd-section-full">
                  <div className="rrd-section-title">Assigned Room</div>

                  {!row?.chambreAffectee ? (
                    <div className="rrd-muted">No room assigned yet.</div>
                  ) : (
                    <div className="rrd-room-grid">
                      <div className="rrd-room-pill">
                        <span className="rrd-room-pill-label">Room</span>
                        <span className="rrd-room-pill-value">{row.chambreAffectee.numero}</span>
                      </div>

                      <div className="rrd-room-pill">
                        <span className="rrd-room-pill-label">Type</span>
                        <span className="rrd-room-pill-value">{row.chambreAffectee.type}</span>
                      </div>

                      <div className="rrd-room-pill">
                        <span className="rrd-room-pill-label">Capacity</span>
                        <span className="rrd-room-pill-value">{row.chambreAffectee.capacite}</span>
                      </div>

                      <div className="rrd-room-pill">
                        <span className="rrd-room-pill-label">Price / Night</span>
                        <span className="rrd-room-pill-value">{row.chambreAffectee.prixNuit}</span>
                      </div>

                      <div className="rrd-room-pill">
                        <span className="rrd-room-pill-label">Etat</span>
                        <span className="rrd-room-pill-value">{row.chambreAffectee.etat || "—"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
