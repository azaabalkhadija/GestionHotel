import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import "../css/roomDetailsClient.css";
import { getRooms } from "../services/admin";
import { checkAvailabilityClient } from "../services/client";

function nightsBetween(dateIn, dateOut) {
  const a = new Date(dateIn);
  const b = new Date(dateOut);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const diff = b - a;
  const nights = Math.round(diff / (1000 * 60 * 60 * 24));
  return Math.max(1, nights || 0);
}

function bedLabel(type) {
  const t = String(type || "").toUpperCase();
  if (t === "SINGLE") return "Single Bed";
  if (t === "DOUBLE") return "Double Bed";
  if (t === "TWIN") return "Twin Beds";
  if (t === "FAMILY") return "Family Beds";
  return "Comfort Bed";
}

const IMG_BY_TYPE = {
  SINGLE: "/src/images/room/room-b1.jpg",
  DOUBLE: "/src/images/room/room-b2.jpg",
  TWIN: "/src/images/room/room-b3.jpg",
  FAMILY: "/src/images/room/room-b4.jpg",
};

export default function RoomDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { type } = useParams();

  const roomType = String(type || "").toUpperCase();

  //  room summary coming from Rooms page 
  const passed = location?.state || null;

  // fallback fetch only if no state (refresh/direct URL)
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [roomErr, setRoomErr] = useState("");
  const [allRooms, setAllRooms] = useState([]);

  const needsFetch = !passed;

  useEffect(() => {
    if (!needsFetch) return;

    const loadRooms = async () => {
      try {
        setRoomErr("");
        setLoadingRoom(true);
        const data = await getRooms();
        setAllRooms(Array.isArray(data) ? data : []);
      } catch (e) {
        setRoomErr("Error loading rooms.");
      } finally {
        setLoadingRoom(false);
      }
    };

    loadRooms();
  }, [needsFetch]);

  const computedSummary = useMemo(() => {
    if (!needsFetch) return null;

    const roomsOfType = allRooms.filter(
      (r) => String(r?.type || "").toUpperCase() === roomType
    );

    if (!roomsOfType.length) return null;

    const prices = roomsOfType
      .map((r) => Number(r?.prixNuit))
      .filter((p) => !Number.isNaN(p));

    const caps = roomsOfType
      .map((r) => Number(r?.capacite))
      .filter((c) => !Number.isNaN(c));

    const minPrice = prices.length ? Math.min(...prices) : null;
    const maxPrice = prices.length ? Math.max(...prices) : null;
    const maxCap = caps.length ? Math.max(...caps) : null;

    return {
      type: roomType,
      title: `${roomType} Room`,
      prixMin: minPrice,
      prixMax: maxPrice,
      capaciteMax: maxCap,
      img: IMG_BY_TYPE[roomType] || "/src/images/room/room-b1.jpg",
    };
  }, [needsFetch, allRooms, roomType]);

  //room info 
  const roomInfo = useMemo(() => {
    if (passed?.type) {
      return {
        type: String(passed.type).toUpperCase(),
        title: passed.title || `${String(passed.type).toUpperCase()} Room`,
        prixMin: passed.prixMin ?? null,
        prixMax: passed.prixMax ?? null,
        capaciteMax: passed.capaciteMax ?? null,
        img: passed.img || IMG_BY_TYPE[String(passed.type).toUpperCase()] || "/src/images/room/room-b1.jpg",
      };
    }
    return computedSummary;
  }, [passed, computedSummary]);

  // booking form state 
  const [dateArrivee, setDateArrivee] = useState("");
  const [dateDepart, setDateDepart] = useState("");
  const [nbPersonnes, setNbPersonnes] = useState(2);

  const [loadingAvail, setLoadingAvail] = useState(false);
  const [error, setError] = useState("");

  const nights = useMemo(() => {
    if (!dateArrivee || !dateDepart) return 0;
    return nightsBetween(dateArrivee, dateDepart);
  }, [dateArrivee, dateDepart]);

  const estimated = useMemo(() => {
    const price = roomInfo?.prixMin;
    if (price == null || !nights) return null;
    return Number(price) * nights;
  }, [roomInfo, nights]);

  const onCheckAvailability = async (e) => {
    e.preventDefault();
    setError("");

    if (!dateArrivee || !dateDepart) return setError("Please select check-in and check-out dates.");
    if (new Date(dateDepart) <= new Date(dateArrivee)) return setError("Check-out must be after check-in.");
    if (!nbPersonnes || Number(nbPersonnes) < 1) return setError("Guests must be at least 1.");

    try {
      setLoadingAvail(true);

      const data = await checkAvailabilityClient({
        dateArrivee,
        dateDepart,
        typeChambre: roomType,
        nbPersonnes: Number(nbPersonnes),
      });

      if (!data?.disponible) {
        setError("No available room for the selected dates and room type.");
        return;
      }

      navigate("/booking-request", {
        state: {
          dateArrivee,
          dateDepart,
          nbPersonnes: Number(nbPersonnes),
          typeChambre: roomType,
          prixNuit: data?.prixNuit ?? null,
        },
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Server error while checking availability.");
    } finally {
      setLoadingAvail(false);
    }
  };

  const priceText = useMemo(() => {
    if (!roomInfo) return "—";
    const min = roomInfo.prixMin;
    const max = roomInfo.prixMax;

    if (min == null) return "—";
    if (max == null || min === max) return `${min} MAD`;
    return `${min}–${max} MAD`;
  }, [roomInfo]);

  return (
    
      <div className="rtd-page">
        <div className="rtd-breadcrumb">
          <div className="rtd-bc-inner">
            <h2>Room Details</h2>
            <div className="rtd-bc-links">
              <Link to="/">Home</Link>
              <span> / </span>
              <Link to="/rooms">Rooms</Link>
              <span> / </span>
              <span className="rtd-bc-current">{roomType}</span>
            </div>
          </div>
        </div>

        <div className="rtd-container">
          <div className="rtd-grid">
            {/* Details */}
            <div className="rtd-left">
              {loadingRoom ? (
                <div className="rtd-card rtd-muted">Loading room details...</div>
              ) : roomErr ? (
                <div className="rtd-card rtd-alert">{roomErr}</div>
              ) : !roomInfo ? (
                <div className="rtd-card rtd-alert">
                  No rooms found for type <b>{roomType}</b>.
                </div>
              ) : (
                <>
                  <div className="rtd-hero">
                    <img className="rtd-hero-img" src={roomInfo.img} alt="room" />
                  </div>

                  <div className="rtd-card">
                    <div className="rtd-title-row">
                      <div>
                        <h3 className="rtd-title">{roomInfo.title}</h3>
                        <div className="rtd-subtitle">
                          {roomInfo.type} • {bedLabel(roomInfo.type)}
                        </div>
                      </div>

                      <div className="rtd-price">
                        <span className="rtd-price-num">{priceText}</span>
                        <span className="rtd-price-suf">/ night</span>
                      </div>
                    </div>

                    <div className="rtd-info">
                      <div className="rtd-info-row">
                        <span className="rtd-info-label">Capacity:</span>
                        <span className="rtd-info-val">
                          Max {roomInfo.capaciteMax ?? "—"} person(s)
                        </span>
                      </div>

                      <div className="rtd-info-row">
                        <span className="rtd-info-label">Services:</span>
                        <span className="rtd-info-val">Wifi, TV, Bathroom, AC, Cleaning</span>
                      </div>
                    </div>

                    <div className="rtd-note">
                      Tip: Choose your dates on the right to check availability and continue booking.
                    </div>
                  </div>
                </>
              )}
            </div>

            {/*  Availability form */}
            <div className="rtd-right">
              <div className="booking-form rtd-bookingWrap">
                <h3>Check Availability</h3>

                <form onSubmit={onCheckAvailability}>
                  <div className="check-date">
                    <label htmlFor="date-in">Check In:</label>
                    <input
                      type="date"
                      className="date-input"
                      id="date-in"
                      value={dateArrivee}
                      onChange={(e) => setDateArrivee(e.target.value)}
                    />
                    <i className="icon_calendar"></i>
                  </div>

                  <div className="check-date">
                    <label htmlFor="date-out">Check Out:</label>
                    <input
                      type="date"
                      className="date-input"
                      id="date-out"
                      value={dateDepart}
                      onChange={(e) => setDateDepart(e.target.value)}
                    />
                    <i className="icon_calendar"></i>
                  </div>

                  <div className="select-option">
                    <label htmlFor="guest">Number of Guests:</label>
                    <input
                      id="guest"
                      type="number"
                      min="1"
                      className="date-input"
                      value={nbPersonnes}
                      onChange={(e) => setNbPersonnes(e.target.value)}
                      placeholder="Enter number of guests"
                    />
                  </div>

                  <div className="select-option">
                    <label htmlFor="roomType">Room Type:</label>
                    <select id="roomType" value={roomType} disabled>
                      <option value={roomType}>{roomType}</option>
                    </select>
                  </div>

                 
                  {roomInfo?.prixMin != null && nights > 0 && (
                    <div className="rtd-estimate">
                      <div>
                        Nights: <b>{nights}</b>
                      </div>
                      <div>
                        Est. total: <b>{estimated ?? "—"}</b> MAD
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={loadingAvail}>
                    {loadingAvail ? "Checking..." : "Check Availability"}
                  </button>

                  {error && (
                    <p style={{ marginTop: 12, color: "crimson", fontWeight: 600 }}>
                      {error}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
}
