import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getAuth } from "../../services/global";
import "../../css/receptionReservationsList.css";
import { getAllReservations } from "../../services/reception";

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function ReceptionReservationsList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters 
  const [statut, setStatut] = useState(""); // EN_ATTENTE | CONFIRMEE | EN_COURS | TERMINEE | ANNULEE
  const [canal, setCanal] = useState(""); // EN_LIGNE | SUR_PLACE
  const [typeChambre, setTypeChambre] = useState(""); // SINGLE | DOUBLE | TWIN | FAMILY
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  
  useEffect(() => {
    const auth = getAuth();
    if (!auth) return navigate("/login");
    if (auth.user.role !== "RECEPTIONNIST" && auth.user.role !== "ADMIN") return navigate("/login");
  }, [navigate]);

  const params = useMemo(() => {
    // build query params only when set
    const p = {};
    if (statut) p.statut = statut;
    if (canal) p.canal = canal;
    if (typeChambre) p.typeChambre = typeChambre;
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  }, [statut, canal, typeChambre, from, to]);

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getAllReservations(params);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Error loading reservations.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onApply = (e) => {
    e.preventDefault();
    load();
  };

  const onReset = () => {
    setStatut("");
    setCanal("");
    setTypeChambre("");
    setFrom("");
    setTo("");
    // reload without filters
    setTimeout(() => load(), 0);
  };

  return (
    <Layout>
      <div className="rrl-page">
        <div className="rrl-header">
          <div>
            <h2>Reservations</h2>
            <p>Filter and open reservation details.</p>
          </div>

          <button className="rrl-btn rrl-btn-ghost" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="rrl-card rrl-filters">
          <form className="rrl-form" onSubmit={onApply}>
            <div className="rrl-grid">
              <div className="rrl-field">
                <label>Status</label>
                <select value={statut} onChange={(e) => setStatut(e.target.value)}>
                  <option value="">All</option>
                  <option value="EN_ATTENTE">EN_ATTENTE</option>
                  <option value="CONFIRMEE">CONFIRMEE</option>
                  <option value="EN_COURS">EN_COURS</option>
                  <option value="TERMINEE">TERMINEE</option>
                  <option value="ANNULEE">ANNULEE</option>
                </select>
              </div>

              <div className="rrl-field">
                <label>Channel</label>
                <select value={canal} onChange={(e) => setCanal(e.target.value)}>
                  <option value="">All</option>
                  <option value="SUR_PLACE">SUR_PLACE</option>
                  <option value="EN_LIGNE">EN_LIGNE</option>
                </select>
              </div>

              <div className="rrl-field">
                <label>Room Type</label>
                <select value={typeChambre} onChange={(e) => setTypeChambre(e.target.value)}>
                  <option value="">All</option>
                  <option value="SINGLE">SINGLE</option>
                  <option value="DOUBLE">DOUBLE</option>
                  <option value="TWIN">TWIN</option>
                  <option value="FAMILY">FAMILY</option>
                </select>
              </div>

              <div className="rrl-field">
                <label>From (dateArrivee)</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>

              <div className="rrl-field">
                <label>To (dateArrivee)</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>

            <div className="rrl-actions">
              <button className="rrl-btn rrl-btn-primary" type="submit" disabled={loading}>
                Apply Filters
              </button>
              <button className="rrl-btn rrl-btn-ghost" type="button" onClick={onReset} disabled={loading}>
                Reset
              </button>
            </div>
          </form>
        </div>

        {error && <div className="rrl-alert">{error}</div>}

        <div className="rrl-card">
          {loading ? (
            <div className="rrl-empty">Loading reservations...</div>
          ) : rows.length === 0 ? (
            <div className="rrl-empty">No reservations found.</div>
          ) : (
            <div className="rrl-table-wrap">
              <table className="rrl-table">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Client</th>
                    <th>Phone</th>
                    <th>Room</th>
                    <th>Guests</th>
                    <th>Arrivee</th>
                    <th>Depart</th>
                    <th>Status</th>
                    <th>Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id} className="rrl-row">
                      <td>
                        <Link className="rrl-link" to={`/reservationDetails/${r._id}`}>
                          {r?.numeroReservation || "—"}
                        </Link>
                      </td>
                      <td className="rrl-strong">{r?.client?.nomComplet || "—"}</td>
                      <td>{r?.client?.telephone || "—"}</td>
                      <td>
                        {r?.chambreAffectee?.numero
                          ? `${r.chambreAffectee.numero} (${r?.chambreAffectee?.type || r?.typeChambre || "—"})`
                          : r?.typeChambre || "—"}
                      </td>
                      <td>{r?.nbPersonnes ?? "—"}</td>
                      <td>{fmtDate(r?.dateArrivee)}</td>
                      <td>{fmtDate(r?.dateDepart)}</td>
                      <td>
                        <span className={`rrl-badge rrl-badge-${(r?.statut || "").toLowerCase()}`}>
                          {r?.statut || "—"}
                        </span>
                      </td>
                      <td>{r?.canal || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && rows.length > 0 && (
            <div className="rrl-footer">
              <span>{rows.length} reservation(s)</span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
