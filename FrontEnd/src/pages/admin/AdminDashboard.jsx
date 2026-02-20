import Layout from "../../components/Layout";
import "../../css/admindash.css";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "../../services/global";
import { useEffect, useState } from "react";

function AdminDashboard() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.user.role !== "ADMIN") {
      navigate("/login", { replace: true });
      return;
    }
    setAllowed(true);
  }, [navigate]);

  if (!allowed) return null;

  return (
    <Layout>
      <div className="ad2-page">
        {/* Header */}
        <div className="ad2-header">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Quick overview and shortcuts for today.</p>
          </div>

          {/* CTA button */}
          <Link to="/admin/addroom" className="ad2-cta">
            <span className="ad2-cta-icon">
              <i className="fa fa-bed"></i>
            </span>
            <span className="ad2-cta-text">
              <span className="ad2-cta-title">Add Room</span>
              <span className="ad2-cta-sub">Create a new room</span>
            </span>
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="ad2-grid">
          <Link to="/reservations" className="ad2-card ad2-link">
            <div className="ad2-card-top">
              <div className="ad2-icon">
                <i className="fa fa-calendar-check"></i>
              </div>
              <div className="ad2-title"> Reservations</div>
            </div>
            <div className="ad2-meta">
              <span className="ad2-badge">Today</span>
              <span className="ad2-count">—</span>
            </div>
            <div className="ad2-hint">Open reservations list →</div>
          </Link>

          <Link to="/checkins-today" className="ad2-card ad2-link">
            <div className="ad2-card-top">
              <div className="ad2-icon">
                <i className="fa fa-right-to-bracket"></i>
              </div>
              <div className="ad2-title">Today Check-ins</div>
            </div>
            <div className="ad2-meta">
              <span className="ad2-badge">Today</span>
              <span className="ad2-count">—</span>
            </div>
            <div className="ad2-hint">Track check-ins →</div>
          </Link>

          <Link to="/checkouts-today" className="ad2-card ad2-link">
            <div className="ad2-card-top">
              <div className="ad2-icon">
                <i className="fa fa-right-from-bracket"></i>
              </div>
              <div className="ad2-title">Today Check-outs</div>
            </div>
            <div className="ad2-meta">
              <span className="ad2-badge">Today</span>
              <span className="ad2-count">—</span>
            </div>
            <div className="ad2-hint">See invoices / check-outs →</div>
          </Link>

          <Link to="/admin/clients" className="ad2-card ad2-link">
            <div className="ad2-card-top">
              <div className="ad2-icon">
                <i className="fa fa-user-plus"></i>
              </div>
              <div className="ad2-title">Clients</div>
            </div>
            <div className="ad2-meta">
              <span className="ad2-badge">Today</span>
              <span className="ad2-count">—</span>
            </div>
            <div className="ad2-hint">Open clients list →</div>
          </Link>
        </div>

        <div className="ad2-actions">
          <Link to="/admin/roomslist" className="ad2-action-card">
            <div className="ad2-action-icon">
              <i className="fa fa-list"></i>
            </div>
            <div className="ad2-action-text">
              <div className="ad2-action-title">Rooms List</div>
              <div className="ad2-action-sub">Manage rooms & availability</div>
            </div>
          </Link>

          <Link to="/factures" className="ad2-action-card">
            <div className="ad2-action-icon">
              <i className="fa fa-file-invoice"></i>
            </div>
            <div className="ad2-action-text">
              <div className="ad2-action-title">Facturations</div>
              <div className="ad2-action-sub">Invoices and billing</div>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;
