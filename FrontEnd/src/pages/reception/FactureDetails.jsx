import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from "../../services/global";
import { getFactureById } from "../../services/reception";
import "../../css/FactureDetails.css";

export default function FactureDetails() {
  const navigate = useNavigate();
  const auth = getAuth();
  const { id } = useParams();
  const role = auth?.user.role;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [facture, setFacture] = useState(null);

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getFactureById(id);
      setFacture(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Error loading facture.");
      setFacture(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      navigate("/login");
      return;
    }
    if (role !== "RECEPTIONNIST" && role !== "ADMIN") {
      navigate("/login");
      return;
    }
    if (id) load();

  }, [id]);

  const r = facture?.reservation;
  const c = r?.client;
  const ch = r?.chambreAffectee;
  
  return (
    getAuth() && 
    <Layout>
      <div className="rfacd-page">
        <div className="rfacd-header">
          <div>
            <h2 className="rfacd-title">Facture Details</h2>
            <p className="rfacd-subtitle">Invoice summary for the reservation.</p>
          </div>

          <button className="rfacd-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        {error && <div className="rfacd-alert">{error}</div>}

        <div className="rfacd-card">
          {loading ? (
            <div className="rfacd-empty">Loading...</div>
          ) : !facture ? (
            <div className="rfacd-empty">Facture not found.</div>
          ) : (
            <>
              <div className="rfacd-top">
                <div className="rfacd-pill">
                  <span>Facture</span>
                  <strong>{facture?.numeroFacture || "—"}</strong>
                </div>
                <div className="rfacd-pill">
                  <span>Reservation</span>
                  <strong>{r?.numeroReservation || "—"}</strong>
                </div>
                <div className="rfacd-pill">
                  <span>Date</span>
                  <strong>
                    {facture?.dateFacture ? new Date(facture.dateFacture).toLocaleDateString() : "—"}
                  </strong>
                </div>
              </div>

              <div className="rfacd-grid">
                <div className="rfacd-section">
                  <h4>Client</h4>
                  <p><b>Name:</b> {c?.nomComplet || "—"}</p>
                  <p><b>Phone:</b> {c?.telephone || "—"}</p>
                  <p><b>Email:</b> {c?.email || "—"}</p>
                  <p><b>ID:</b> {(c?.typePiece || "—") + " / " + (c?.numeroPiece || "—")}</p>
                </div>

                <div className="rfacd-section">
                  <h4>Stay</h4>
                  <p><b>Check-in:</b> {r?.dateArrivee ? new Date(r.dateArrivee).toLocaleDateString() : "—"}</p>
                  <p><b>Check-out:</b> {r?.dateDepart ? new Date(r.dateDepart).toLocaleDateString() : "—"}</p>
                  <p><b>Guests:</b> {r?.nbPersonnes ?? "—"}</p>
                  <p><b>Room type:</b> {r?.typeChambre || "—"}</p>
                </div>

                <div className="rfacd-section">
                  <h4>Room</h4>
                  <p><b>Room #:</b> {ch?.numero || "—"}</p>
                  <p><b>Type:</b> {ch?.type || "—"}</p>
                  <p><b>Capacity:</b> {ch?.capacite ?? "—"}</p>
                  <p><b>Price/night:</b> {facture?.prixNuit ?? ch?.prixNuit ?? "—"}</p>
                </div>

                <div className="rfacd-section rfacd-total">
                  <h4>Totals</h4>
                  <div className="rfacd-total-line">
                    <span>Nights</span>
                    <strong>{facture?.nbNuits ?? "—"}</strong>
                  </div>
                  <div className="rfacd-total-line">
                    <span>Price / night</span>
                    <strong>{facture?.prixNuit ?? "—"}</strong>
                  </div>
                  <div className="rfacd-total-line big">
                    <span>Total</span>
                    <strong>{facture?.total ?? "—"}</strong>
                  </div>
                </div>
              </div>

              <div className="rfacd-note">
                This invoice is generated automatically at check-out.
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
