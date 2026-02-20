import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { getRooms } from "../services/admin"; 
import "../css/clientRoomsPage.css";

function prettyType(type) {
  if (!type) return "Room";
  return String(type)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Error loading rooms.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // group by type 
  const roomTypes = useMemo(() => {
    const map = new Map();

    for (const r of rooms) {
      const type = String(r?.type || "").toUpperCase();
      if (!type) continue;

      if (!map.has(type)) {
        map.set(type, {
          type,
          title: prettyType(type),
          count: 0,
          capaciteMax: 0,
          prixMin: null,
          prixMax: null,
        });
      }

      const g = map.get(type);

      const cap = Number(r?.capacite || 0);
      if (cap > g.capaciteMax) g.capaciteMax = cap;

      const prix = Number(r?.prixNuit);
      if (!Number.isNaN(prix)) {
        if (g.prixMin === null || prix < g.prixMin) g.prixMin = prix;
        if (g.prixMax === null || prix > g.prixMax) g.prixMax = prix;
      }
    }

    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [rooms]);

  return (
    
      <div className="crp-page">
        {/* Breadcrumb */}
        <div className="crp-breadcrumb">
          <div className="crp-bc-inner">
            <h2>Our Rooms</h2>
            <div className="crp-bc-links">
              <Link to="/" className="crp-bc-link">Home</Link>
              <span className="crp-bc-sep">›</span>
              <span className="crp-bc-current">Rooms</span>
            </div>
          </div>
        </div>

        <div className="crp-container">
          <div className="crp-header">
            <div>
              <h3>Room Types</h3>
            </div>

            <button className="crp-refresh" onClick={load} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {error && <div className="crp-alert">{error}</div>}

          <div className="crp-card">
            {loading ? (
              <div className="crp-empty">Loading room types...</div>
            ) : roomTypes.length === 0 ? (
              <div className="crp-empty">No rooms found in database.</div>
            ) : (
              <div className="crp-grid">
                {roomTypes.map((t) => {
                  const img = IMG_BY_TYPE[t.type] || "/src/images/room/room-b1.jpg";
                  const priceText =
                    t.prixMin == null
                      ? "—"
                      : t.prixMin === t.prixMax
                      ? `${t.prixMin} MAD`
                      : `${t.prixMin}–${t.prixMax} MAD`;

                  return (
                    <div className="crp-room" key={t.type}>
                      <div
                        className="crp-room-img"
                        style={{
                          backgroundImage: `url(${img})`,
                        }}
                      />

                      <div className="crp-room-body">
                        <div className="crp-room-titleRow">
                          <h4 className="crp-room-title">{t.title}</h4>
                          
                        </div>

                        <div className="crp-room-price">
                          <span className="crp-room-priceValue">{priceText}</span>
                          <span className="crp-room-priceSuffix">/ per night</span>
                        </div>

                        <div className="crp-room-table">
                          <div className="crp-row">
                            <span className="crp-key">Capacity:</span>
                            <span className="crp-val">Max {t.capaciteMax || "—"} person</span>
                          </div>
                          <div className="crp-row">
                            <span className="crp-key">Bed:</span>
                            <span className="crp-val">{bedLabel(t.type)}</span>
                          </div>
                          <div className="crp-row">
                            <span className="crp-key">Services:</span>
                            <span className="crp-val">Wifi, TV, Bathroom, AC</span>
                          </div>
                        </div>

                        
                       <Link
                         to={`/rooms/${encodeURIComponent(t.type)}`}
                         state={{
                            type: t.type,
                            title: t.title,
                            prixMin: t.prixMin,
                            prixMax: t.prixMax,
                            capaciteMax: t.capaciteMax,
                            img: img,
                         }}
                         className="crp-primaryBtn"
                          >
                          More Details
                          </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          
          {!loading && roomTypes.length > 0 && (
            <div className="crp-pagination">
              <span className="crp-pageDot crp-pageDotActive">1</span>
            </div>
          )}
        </div>
      </div>
  
  );
}
