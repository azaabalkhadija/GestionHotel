import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/clientBookingRequest.css";

import { createReservationClient } from "../services/client";

function nightsBetween(dateIn, dateOut) {
  const a = new Date(dateIn);
  const b = new Date(dateOut);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const diff = b - a;
  const nights = Math.round(diff / (1000 * 60 * 60 * 24));
  return Math.max(1, nights || 0);
}

export default function BookingRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const [dateArrivee] = useState(state.dateArrivee || "");
  const [dateDepart] = useState(state.dateDepart || "");
  const [nbPersonnes] = useState(state.nbPersonnes || 2);
  const [typeChambre] = useState(state.typeChambre || "SINGLE");
  const [prixNuit] = useState(state.prixNuit ?? null);

  useEffect(() => {
    if (!dateArrivee || !dateDepart || !typeChambre || !nbPersonnes) {
      navigate("/");
    }
  }, []);

  const nights = useMemo(() => {
    if (!dateArrivee || !dateDepart) return 0;
    return nightsBetween(dateArrivee, dateDepart);
  }, [dateArrivee, dateDepart]);

  const total = useMemo(() => {
    if (!prixNuit || !nights) return null;
    return Number(prixNuit) * Number(nights);
  }, [prixNuit, nights]);

  const [client, setClient] = useState({
    nomComplet: "",
    telephone: "",
    email: "",
    typePiece: "CIN",
    numeroPiece: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !client.nomComplet.trim() ||
      !client.telephone.trim() ||
      !client.email.trim() ||
      !client.typePiece.trim() ||
      !client.numeroPiece.trim()
    ) {
      return setError("Please fill all fields.");
    }

    try {
      setLoading(true);

      const payload = {
        dateArrivee,
        dateDepart,
        nbPersonnes: Number(nbPersonnes),
        typeChambre,
        client: {
          nomComplet: client.nomComplet.trim(),
          telephone: client.telephone.trim(),
          email: client.email.trim(),
          typePiece: client.typePiece.trim(),
          numeroPiece: client.numeroPiece.trim(),
        },
      };

      await createReservationClient(payload);
      setSuccess("Your reservation request has been submitted (EN_ATTENTE).");
    } catch (err) {
      setError(err?.response?.data?.message || "Server error while submitting request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cbrx-root">
      <div className="cbrx-shell">
        <div className="cbrx-topbar">
          <div className="cbrx-topbar-left">
            <h2 className="cbrx-title">Booking Request</h2>
            <p className="cbrx-subtitle">Review your booking and enter your details.</p>
          </div>

          <button className="cbrx-btn cbrx-btn-ghost" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        <div className="cbrx-grid">
          <div className="cbrx-card">
            <div className="cbrx-cardhead">Your Booking</div>

            <div className="cbrx-summary">
              <div className="cbrx-line">
                <span>Check-in</span>
                <b>{new Date(dateArrivee).toLocaleDateString()}</b>
              </div>

              <div className="cbrx-line">
                <span>Check-out</span>
                <b>{new Date(dateDepart).toLocaleDateString()}</b>
              </div>

              <div className="cbrx-line">
                <span>Guests</span>
                <b>{nbPersonnes}</b>
              </div>

              <div className="cbrx-line">
                <span>Room type</span>
                <b className="cbrx-pill">{typeChambre}</b>
              </div>

              <div className="cbrx-line">
                <span>Price / night</span>
                <b>{prixNuit} MAD</b>
              </div>

              <div className="cbrx-line">
                <span>Nights</span>
                <b>{nights}</b>
              </div>

              <div className="cbrx-divider" />

              <div className="cbrx-total">
                <span>Estimated total</span>
                <b>{total} MAD</b>
              </div>

              <p className="cbrx-note">
                * Final confirmation depends on hotel validation.
              </p>
            </div>
          </div>

          {/*form */}
          <div className="cbrx-card">
            <div className="cbrx-cardhead">Client Information</div>
            <p className="cbrx-formhint">
              Your request will be created with status <b>EN_ATTENTE</b>.
            </p>

            {error && <div className="cbrx-alert cbrx-alert-danger">{error}</div>}
            {success && <div className="cbrx-alert cbrx-alert-success">{success}</div>}

            <form className="cbrx-form" onSubmit={onSubmit}>
              <div className="cbrx-fields">
                <div className="cbrx-field cbrx-field-full">
                  <label className="cbrx-label">Full Name *</label>
                  <input
                    className="cbrx-control"
                    value={client.nomComplet}
                    onChange={(e) => setClient((c) => ({ ...c, nomComplet: e.target.value }))}
                    placeholder="Nom Complet"
                  />
                </div>

                <div className="cbrx-field">
                  <label className="cbrx-label">Phone *</label>
                  <input
                    className="cbrx-control"
                    value={client.telephone}
                    onChange={(e) => setClient((c) => ({ ...c, telephone: e.target.value }))}
                    placeholder="Téléphone"
                  />
                </div>

                <div className="cbrx-field">
                  <label className="cbrx-label">Email *</label>
                  <input
                    className="cbrx-control"
                    type="email"
                    value={client.email}
                    onChange={(e) => setClient((c) => ({ ...c, email: e.target.value }))}
                    placeholder="Email"
                  />
                </div>

                <div className="cbrx-field">
                  <label className="cbrx-label">ID Type *</label>
                  <select
                    className="cbrx-control"
                    value={client.typePiece}
                    onChange={(e) => setClient((c) => ({ ...c, typePiece: e.target.value }))}
                  >
                    <option value="CIN">CIN</option>
                    <option value="PASSPORT">PASSPORT</option>
                  </select>
                </div>

                <div className="cbrx-field">
                  <label className="cbrx-label">ID Number *</label>
                  <input
                    className="cbrx-control"
                    value={client.numeroPiece}
                    onChange={(e) => setClient((c) => ({ ...c, numeroPiece: e.target.value }))}
                    placeholder="CIN / Passport"
                  />
                </div>
              </div>

              <button className="cbrx-btn cbrx-btn-primary" disabled={loading}>
                {loading ? "Submitting..." : "Submit Reservation Request"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
