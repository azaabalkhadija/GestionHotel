import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { getAuth } from "../../services/global";
import { useNavigate, useParams } from "react-router-dom";
import { getRoomById, updateRoom } from "../../services/admin";
import "../../css/roomDetails.css";

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [form, setForm] = useState({
    numero: "",
    type: "SINGLE",
    capacite: 1,
    prixNuit: "",
    etat: "DISPONIBLE",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const data = await getRoomById(id);
      setRoom(data);

      setForm({
        numero: data?.numero || "",
        type: data?.type || "SINGLE",
        capacite: data?.capacite ?? 1,
        prixNuit: data?.prixNuit ?? "",
        etat: data?.etat || "DISPONIBLE",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Error loading room.");
      setRoom(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const role = auth?.user?.role || auth?.role;

    if (!auth || role !== "ADMIN") {
      navigate("/login", { replace: true });
      return;
    }

    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSave = async () => {
    setError("");
    setSuccess("");

    if (!form.numero.trim()) return setError("Room number is required.");
    if (!form.type) return setError("Room type is required.");
    if (Number(form.capacite) < 1) return setError("Capacity must be at least 1.");
    if (form.prixNuit === "" || Number(form.prixNuit) <= 0)
      return setError("Price/night must be > 0.");

    try {
      setSaving(true);

      const payload = {
        numero: form.numero.trim(),
        type: form.type,
        capacite: Number(form.capacite),
        prixNuit: Number(form.prixNuit),
        etat: form.etat,
      };

      const updated = await updateRoom(id, payload);
      setRoom(updated);
      setEditMode(false);
      setSuccess("Room updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Error while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="rd-page">
        <div className="rd-header">
          <button className="rd-back" onClick={() => navigate("/admin/roomslist")}>
            ← Back to Rooms List
          </button>

          <div className="rd-title">
            <h2>Room Details</h2>
            <p>View and edit room information.</p>
          </div>

          {!loading && room && (
            <button className="rd-edit" onClick={() => setEditMode((s) => !s)}>
              {editMode ? "Cancel" : "Edit"}
            </button>
          )}
        </div>

        {error && <div className="rd-alert danger">{error}</div>}
        {success && <div className="rd-alert success">{success}</div>}

        <div className="rd-card">
          {loading ? (
            <div className="rd-empty">Loading...</div>
          ) : !room ? (
            <div className="rd-empty">Room not found.</div>
          ) : (
            <>
              {!editMode ? (
                <div className="rd-grid">
                  <div className="rd-item">
                    <span>ID</span>
                    <b>{room._id}</b>
                  </div>
                  <div className="rd-item">
                    <span>Numero</span>
                    <b>{room.numero}</b>
                  </div>
                  <div className="rd-item">
                    <span>Type</span>
                    <b>{room.type}</b>
                  </div>
                  <div className="rd-item">
                    <span>Capacité</span>
                    <b>{room.capacite}</b>
                  </div>
                  <div className="rd-item">
                    <span>Prix/Nuit</span>
                    <b>{room.prixNuit}</b>
                  </div>
                  <div className="rd-item">
                    <span>Etat</span>
                    <b>{room.etat || "—"}</b>
                  </div>
                </div>
              ) : (
                <div className="rd-form">
                  <div className="rd-form-grid">
                    <div className="rd-field">
                      <label>Numero</label>
                      <input
                        value={form.numero}
                        onChange={(e) => onChange("numero", e.target.value)}
                      />
                    </div>

                    <div className="rd-field">
                      <label>Type</label>
                      <select value={form.type} onChange={(e) => onChange("type", e.target.value)}>
                        <option value="SINGLE">SINGLE</option>
                        <option value="DOUBLE">DOUBLE</option>
                        <option value="TWIN">TWIN</option>
                      </select>
                    </div>

                    <div className="rd-field">
                      <label>Capacité</label>
                      <input
                        type="number"
                        min="1"
                        value={form.capacite}
                        onChange={(e) => onChange("capacite", e.target.value)}
                      />
                    </div>

                    <div className="rd-field">
                      <label>Prix/Nuit</label>
                      <input
                        type="number"
                        min="1"
                        value={form.prixNuit}
                        onChange={(e) => onChange("prixNuit", e.target.value)}
                      />
                    </div>

                    <div className="rd-field rd-full">
                      <label>Etat</label>
                      <select value={form.etat} onChange={(e) => onChange("etat", e.target.value)}>
                        <option value="DISPONIBLE">DISPONIBLE</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                      </select>
                    </div>
                  </div>

                  <div className="rd-actions">
                    <button className="rd-btn primary" onClick={onSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      className="rd-btn ghost"
                      onClick={() => setEditMode(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
