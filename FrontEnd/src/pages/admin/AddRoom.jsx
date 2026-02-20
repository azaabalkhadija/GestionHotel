import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import "../../css/adminAddRoom.css";
import { getAuth } from "../../services/global";
import { addRoom } from "../../services/admin";
import { useNavigate } from "react-router-dom";

export default function AddRoom() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    numero: "",
    type: "SINGLE",
    capacite: 1,
    prixNuit: "",
    etat: "DISPONIBLE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.user.role !== "ADMIN") {
      navigate("/login");
      return;
    }
  }, []);

  const onChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.numero.trim()) return setError("Room number is required.");
    if (!form.type) return setError("Room type is required.");
    if (form.capacite < 1) return setError("Capacity must be at least 1.");
    if (form.prixNuit === "" || Number(form.prixNuit) <= 0)
      return setError("Price/night must be greater than 0.");

    try {
      setLoading(true);

      const payload = {
        numero: form.numero.trim(),
        type: form.type,
        capacite: Number(form.capacite),
        prixNuit: Number(form.prixNuit),
        etat: form.etat,
      };

      const res = await addRoom(payload);

      setSuccess(`Room created successfully (Room #${res?.numero || payload.numero}).`);
      setForm({
        numero: "",
        type: "SINGLE",
        capacite: 1,
        prixNuit: "",
        etat: "DISPONIBLE",
      });
    } catch (err) {
        console.log("CREATE ROOM ERROR:", err);
         console.log("status:", err?.response?.status);
       console.log("data:", err?.response?.data);
      setError(err?.response?.data?.message || "Server error while creating room.");
    } finally {
      setLoading(false);
    }
  };
  if (!getAuth() || getAuth().user.role !== "ADMIN") return navigate("/login");
  return (
    <Layout>
      <div className="aar-page">
        <div className="aar-header">
          <div>
            <h2>Add Room</h2>
            <p>Create a new room and define its price, type, and state.</p>
          </div>

          <button
            className="aar-back"
            type="button"
            onClick={() => navigate("/admin/roomslist")}
          >
            ← Rooms List
          </button>
        </div>

        {error && <div className="aar-alert aar-alert-danger">{error}</div>}
        {success && <div className="aar-alert aar-alert-success">{success}</div>}

        <div className="aar-card">
          <form onSubmit={onSubmit} className="aar-form">
            <div className="aar-grid">
              <div className="aar-field">
                <label>Room Number *</label>
                <input
                  type="text"
                  value={form.numero}
                  onChange={(e) => onChange("numero", e.target.value)}
                  placeholder="Example: 101"
                />
              </div>

              <div className="aar-field">
                <label>Room Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => onChange("type", e.target.value)}
                >
                  <option value="SINGLE">SINGLE</option>
                  <option value="DOUBLE">DOUBLE</option>
                  <option value="TWIN">TWIN</option>
                  <option value="FAMILY">FAMILY</option>
                </select>
              </div>

              <div className="aar-field">
                <label>Capacity *</label>
                <input
                  type="number"
                  min="1"
                  value={form.capacite}
                  onChange={(e) => onChange("capacite", e.target.value)}
                />
              </div>

              <div className="aar-field">
                <label>Price / Night (MAD) *</label>
                <input
                  type="number"
                  min="1"
                  value={form.prixNuit}
                  onChange={(e) => onChange("prixNuit", e.target.value)}
                  placeholder="Example: 350"
                />
              </div>

              <div className="aar-field aar-full">
                <label>Status (Etat)</label>
                <select
                  value={form.etat}
                  onChange={(e) => onChange("etat", e.target.value)}
                >
                  <option value="DISPONIBLE">DISPONIBLE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
            </div>

            <div className="aar-actions">
              <button className="aar-btn aar-btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Room"}
              </button>
              <button
                type="button"
                className="aar-btn aar-btn-ghost"
                onClick={() => setForm({ numero: "", type: "SINGLE", capacite: 1, prixNuit: "", etat: "DISPONIBLE" })}
                disabled={loading}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
