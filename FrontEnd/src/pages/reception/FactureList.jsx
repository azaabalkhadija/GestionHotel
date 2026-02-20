import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import { getAuth } from "../../services/global";
import { getAllFactures } from "../../services/reception";
import "../../css/facturesList.css";
import { useNavigate } from "react-router-dom";

export default function FactureList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [numeroFacture, setNumeroFacture] = useState("");
  const [numeroReservation, setNumeroReservation] = useState("");
  const [q, setQ] = useState(""); // client name

  const auth = getAuth();
  const role = auth?.user?.role;
  const canView = role === "RECEPTIONNIST" || role === "ADMIN";

  // filters params
  const params = useMemo(() => {
    const p = {};
    if (from) p.from = from;
    if (to) p.to = to;
    if (numeroFacture.trim()) p.numeroFacture = numeroFacture.trim();
    if (numeroReservation.trim()) p.numeroReservation = numeroReservation.trim();
    if (q.trim()) p.q = q.trim();
    return p;
  }, [from, to, numeroFacture, numeroReservation, q]);

  const load = async () => {
    try {
      setError("");
      setLoading(true);

      const data = await getAllFactures(params);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Error while loading invoices (factures).");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth) {
      navigate("/login");
      return;
    }
    if (!canView) {
      navigate("/login");
      return;
    }
    load();
  }, []);

  const onApply = (e) => {
    e.preventDefault();
    load();
  };

  // Clear / Reset 
  const onReset = () => {
    setFrom("");
    setTo("");
    setNumeroFacture("");
    setNumeroReservation("");
    setQ("");
    // reload without filters
    setTimeout(() => load(), 0);
  };

  const totalSum = useMemo(() => {
    return rows.reduce((acc, f) => acc + (Number(f?.total) || 0), 0);
  }, [rows]);

  const goToDetails = (factureId) => {
    if (!factureId) return;
    navigate(`/reception/factureDetails/${factureId}`);
  };

  if (!auth) return null;

  return (
    <Layout>
      <div className="fact-page">
        <div className="fact-header">
          <div>
            <h2>Factures</h2>
          </div>

          <button className="fact-refresh" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && <div className="fact-alert">{error}</div>}

        {/* Filters */}
        <div className="fact-card fact-filters">
          <form onSubmit={onApply} className="fact-filters-form">
            <div className="fact-filters-grid">
              <div className="fact-field">
                <label>From</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>

              <div className="fact-field">
                <label>To</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>

              <div className="fact-field" style={{ minWidth: 220 }}>
                <label>Facture #</label>
                <input
                  type="text"
                  value={numeroFacture}
                  onChange={(e) => setNumeroFacture(e.target.value)}
                  placeholder="ex: FAC-2026-001"
                />
              </div>

              <div className="fact-field" style={{ minWidth: 220 }}>
                <label>Reservation #</label>
                <input
                  type="text"
                  value={numeroReservation}
                  onChange={(e) => setNumeroReservation(e.target.value)}
                  placeholder="ex: RES-2026-015"
                />
              </div>

              <div className="fact-field" style={{ minWidth: 260 }}>
                <label>Client name</label>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ex: Mohamed"
                />
              </div>
            </div>

            <div className="fact-actions">
              <button className="fact-btn" type="submit" disabled={loading}>
                Apply
              </button>

              <button className="fact-btn fact-btn-ghost" type="button" onClick={onReset} disabled={loading}>
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="fact-card">
          {loading ? (
            <div className="fact-empty">Loading factures...</div>
          ) : rows.length === 0 ? (
            <div className="fact-empty">No invoices found.</div>
          ) : (
            <div className="fact-table-wrap">
              <table className="fact-table">
                <thead>
                  <tr>
                    <th>Facture</th>
                    <th>Date</th>
                    <th>Reservation</th>
                    <th>Client</th>
                    <th>Room</th>
                    <th>Nights</th>
                    <th>Price/night</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((f) => {
                    const r = f?.reservation;
                    const c = r?.client;
                    const room = r?.chambreAffectee;

                    return (
                      <tr
                        key={f._id}
                        onClick={() => goToDetails(f._id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") goToDetails(f._id);
                        }}
                        style={{ cursor: "pointer" }}
                        title="Open facture details"
                      >
                        <td className="fact-strong">{f?.numeroFacture || "—"}</td>
                        <td>{f?.dateFacture ? new Date(f.dateFacture).toLocaleDateString() : "—"}</td>
                        <td>
                          {r?.numeroReservation || "—"}
                          <div className="fact-sub">
                            {r?.dateArrivee ? new Date(r.dateArrivee).toLocaleDateString() : "—"} →{" "}
                            {r?.dateDepart ? new Date(r.dateDepart).toLocaleDateString() : "—"}
                          </div>
                        </td>
                        <td>
                          <div className="fact-strong">{c?.nomComplet || "—"}</div>
                          <div className="fact-sub">{c?.telephone || "—"}</div>
                          <div className="fact-sub">{c?.email || "—"}</div>
                        </td>
                        <td>
                          {room?.numero ? `${room.numero} (${room.type})` : "—"}
                          <div className="fact-sub">
                            {r?.typeChambre || "—"} • {r?.nbPersonnes ?? "—"} guests
                          </div>
                        </td>
                        <td>{f?.nbNuits ?? "—"}</td>
                        <td>{f?.prixNuit ?? "—"}</td>
                        <td className="fact-amount">{f?.total ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && rows.length > 0 && (
            <div className="fact-footer">
              <span>{rows.length} facture(s)</span>
              <span className="fact-total">
                Total: <b>{totalSum.toFixed(2)}</b>
              </span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
