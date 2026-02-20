import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { getAuth } from "../../services/global";
import { getClients } from "../../services/admin";
import "../../css/adminClientsList.css";
import { useNavigate } from "react-router-dom";

export default function AdminClientsList() {
  const navigate = useNavigate();

  const [allowed, setAllowed] = useState(false);

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (search = "") => {
    try {
      setError("");
      setLoading(true);
      const data = await getClients(search);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Error while loading clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.user.role !== "ADMIN") {
      navigate("/login", { replace: true });
      return;
    }
    setAllowed(true);
    load("");
  }, [navigate]);

  const onSubmitSearch = (e) => {
    e.preventDefault();
    load(q.trim());
  };

  const onClear = () => {
    setQ("");
    load("");
  };

  if (!allowed) return null;

  return (
    <Layout>
      <div className="acl-root">
        <div className="acl-header">
          <div>
            <h2 className="acl-title">Clients</h2>
            <p className="acl-subtitle">Search and view registered clients.</p>
          </div>

          <form className="acl-search" onSubmit={onSubmitSearch}>
            <input
              className="acl-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, phone, email..."
            />
            <button
              className="acl-btn acl-btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "..." : "Search"}
            </button>
            <button
              className="acl-btn acl-btn-ghost"
              type="button"
              onClick={onClear}
              disabled={loading}
            >
              Clear
            </button>
          </form>
        </div>

        {error && <div className="acl-alert acl-alert-danger">{error}</div>}

        <div className="acl-card">
          {loading ? (
            <div className="acl-empty">Loading clients...</div>
          ) : rows.length === 0 ? (
            <div className="acl-empty">No clients found.</div>
          ) : (
            <>
              <div className="acl-tablewrap">
                <table className="acl-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>ID Type</th>
                      <th>ID Number</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((c) => (
                      <tr key={c._id}>
                        <td className="acl-strong">{c.nomComplet || "-"}</td>
                        <td>{c.telephone || "-"}</td>
                        <td>{c.email || "-"}</td>
                        <td>{c.typePiece || "-"}</td>
                        <td>{c.numeroPiece || "-"}</td>
                        <td>
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="acl-footer">
                <span>
                  Showing <b>{rows.length}</b> client(s)
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
