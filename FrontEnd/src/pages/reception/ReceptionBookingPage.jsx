import React, { useMemo, useState, useEffect } from "react";
import { checkAvailability, addReservation } from "../../services/reception";
import "../../css/receptionBooking.css";
import { getAuth } from "../../services/global";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";

function nightsBetween(dateIn, dateOut) {
  const a = new Date(dateIn);
  const b = new Date(dateOut);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const diff = b - a;
  const nights = Math.round(diff / (1000 * 60 * 60 * 24));
  return Math.max(1, nights || 0);
}

export default function ReceptionBookingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getAuth() || getAuth().user.role !== "RECEPTIONNIST") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Availability form
  const [dateArrivee, setDateArrivee] = useState("");
  const [dateDepart, setDateDepart] = useState("");
  const [nbPersonnes, setNbPersonnes] = useState(2);
  const [typeChambre, setTypeChambre] = useState("SINGLE");

  // UI state
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [loadingBook, setLoadingBook] = useState(false);
  const [availResult, setAvailResult] = useState(null); // {disponible, prixNuit?}
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Client form
  const [client, setClient] = useState({
    nomComplet: "",
    telephone: "",
    email: "",
    typePiece: "CIN",
    numeroPiece: "",
  });

  const nights = useMemo(() => {
    if (!dateArrivee || !dateDepart) return 0;
    return nightsBetween(dateArrivee, dateDepart);
  }, [dateArrivee, dateDepart]);

  const estimatedTotal = useMemo(() => {
    if (!availResult?.disponible || !availResult?.prixNuit || !nights) return null;
    return Number(availResult.prixNuit) * nights;
  }, [availResult, nights]);

  const onCheckAvailability = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAvailResult(null);

    if (!dateArrivee || !dateDepart) return setError("Please select check-in and check-out dates.");
    if (new Date(dateDepart) <= new Date(dateArrivee)) return setError("Check-out must be after check-in.");
    if (!nbPersonnes || Number(nbPersonnes) < 1) return setError("Guests must be at least 1.");

    try {
      setLoadingAvail(true);

      const data = await checkAvailability({
        dateArrivee,
        dateDepart,
        typeChambre,
        nbPersonnes: Number(nbPersonnes),
      });

      setAvailResult(data);

      if (!data?.disponible) setError("No available room for the selected criteria.");
    } catch (err) {
      setError(err?.response?.data?.message || "Server error while checking availability.");
    } finally {
      setLoadingAvail(false);
    }
  };

  const onBookNow = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!availResult?.disponible) return setError("Please check availability first.");

    if (
      !client.nomComplet?.trim() ||
      !client.telephone?.trim() ||
      !client.email?.trim() ||
      !client.typePiece?.trim() ||
      !client.numeroPiece?.trim()
    ) {
      return setError("Please fill all client fields: Full name, Phone, Email, ID Type, ID Number.");
    }

    try {
      setLoadingBook(true);

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

      const result = await addReservation(payload);

      setSuccess(
        `Reservation created successfully${
          result?.numeroReservation ? ` (#${result.numeroReservation})` : ""
        }`
      );

      setAvailResult(null);
      setClient({
        nomComplet: "",
        telephone: "",
        email: "",
        typePiece: "CIN",
        numeroPiece: "",
      });
      setDateArrivee("");
      setDateDepart("");
      setNbPersonnes(2);
      setTypeChambre("SINGLE");
    } catch (err) {
      setError(err?.response?.data?.message || "Server error while creating reservation.");
    } finally {
      setLoadingBook(false);
    }
  };

  if (!getAuth() || getAuth().user.role !== "RECEPTIONNIST") {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    getAuth()?.user.role === "RECEPTIONNIST" && (
      <Layout>
        <div className="rb2-page">
          <div className="rb2-header">
            <h2>New Reservation</h2>
          </div>

          {(error || success) && (
            <div className="rb2-alerts">
              {error && <div className="rb2-alert rb2-error">{error}</div>}
              {success && <div className="rb2-alert rb2-success">{success}</div>}
            </div>
          )}

          <div className="rb2-grid">
            <div className="rb2-card">
              <div className="rb2-card-title">Check Availability</div>

              <form onSubmit={onCheckAvailability} className="rb2-form">
                <div className="rb2-field">
                  <label htmlFor="rb2-date-in">Check In</label>
                  <input
                    id="rb2-date-in"
                    type="date"
                    value={dateArrivee}
                    onChange={(e) => setDateArrivee(e.target.value)}
                  />
                </div>

                <div className="rb2-field">
                  <label htmlFor="rb2-date-out">Check Out</label>
                  <input
                    id="rb2-date-out"
                    type="date"
                    value={dateDepart}
                    onChange={(e) => setDateDepart(e.target.value)}
                  />
                </div>

                <div className="rb2-field">
                  <label htmlFor="rb2-guests">Number of Guests</label>
                  <input
                    id="rb2-guests"
                    type="number"
                    min="1"
                    value={nbPersonnes}
                    onChange={(e) => setNbPersonnes(e.target.value)}
                    placeholder="Enter number of guests"
                  />
                </div>

                <div className="rb2-field">
                  <label htmlFor="rb2-roomtype">Room Type</label>
                  <select
                    id="rb2-roomtype"
                    value={typeChambre}
                    onChange={(e) => setTypeChambre(e.target.value)}
                  >
                    <option value="SINGLE">SINGLE</option>
                    <option value="DOUBLE">DOUBLE</option>
                    <option value="TWIN">TWIN</option>
                    <option value="FAMILY">FAMILY</option>
                  </select>
                </div>

                <button type="submit" className="rb2-btn" disabled={loadingAvail}>
                  {loadingAvail ? "Checking..." : "Check Availability"}
                </button>
              </form>

              {availResult?.disponible && (
                <div className="rb2-result">
                  <div className="rb2-result-line">
                    Available — Price/night: <b>{availResult.prixNuit}</b>
                  </div>
                  {nights > 0 && (
                    <div className="rb2-result-line">
                      Nights: <b>{nights}</b>
                      {estimatedTotal !== null && (
                        <>
                          {" "}
                          — Estimated total: <b>{estimatedTotal}</b>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rb2-card">
              <div className="rb2-card-title">Client Information</div>

              {!availResult?.disponible ? (
                <div className="rb2-muted">Check availability first to enable booking.</div>
              ) : (
                <form onSubmit={onBookNow} className="rb2-form">
                  <div className="rb2-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={client.nomComplet}
                      onChange={(e) => setClient((c) => ({ ...c, nomComplet: e.target.value }))}
                      placeholder="Nom Complet"
                    />
                  </div>

                  <div className="rb2-row">
                    <div className="rb2-field">
                      <label>Phone *</label>
                      <input
                        type="text"
                        value={client.telephone}
                        onChange={(e) => setClient((c) => ({ ...c, telephone: e.target.value }))}
                        placeholder="Téléphone"
                      />
                    </div>

                    <div className="rb2-field">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={client.email}
                        onChange={(e) => setClient((c) => ({ ...c, email: e.target.value }))}
                        placeholder="Email"
                      />
                    </div>
                  </div>

                  <div className="rb2-row">
                    <div className="rb2-field">
                      <label>ID Type *</label>
                      <select
                        value={client.typePiece}
                        onChange={(e) => setClient((c) => ({ ...c, typePiece: e.target.value }))}
                      >
                        <option value="CIN">CIN</option>
                        <option value="PASSPORT">PASSPORT</option>
                      </select>
                    </div>

                    <div className="rb2-field">
                      <label>ID Number *</label>
                      <input
                        type="text"
                        value={client.numeroPiece}
                        onChange={(e) => setClient((c) => ({ ...c, numeroPiece: e.target.value }))}
                        placeholder="CIN/Passport number"
                      />
                    </div>
                  </div>

                  <button type="submit" className="rb2-btn" disabled={loadingBook}>
                    {loadingBook ? "Booking..." : "Book Now"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Layout>
    )
  );
}
