// src/components/Header.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../css/style.css";
import { getAuth } from "../services/global";

const Header = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  const logout = () => {
    sessionStorage.removeItem("auth");
    setAuth(null);
    navigate("/login");
  };

  const PublicMenu = () => (
    <ul>
      <li>
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
          Home
        </NavLink>
      </li>

      <li>
        <NavLink to="/rooms" className={({ isActive }) => (isActive ? "active" : "")}>
          Rooms
        </NavLink>

        <ul className="dropdown">
          <li>
            <Link to="/rooms/single">Single Room</Link>
          </li>
          <li>
            <Link to="/rooms/double">Double Room</Link>
          </li>
          <li>
            <Link to="/rooms/twin">Twin Room</Link>
          </li>
          <li>
            <Link to="/rooms/family">Family Room</Link>
          </li>
        </ul>
      </li>

      <li>
        <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
          About Us
        </NavLink>
      </li>

      <li>
        <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
          Contact
        </NavLink>
      </li>
    </ul>
  );

  const AdminMenu = () => (
    <ul>
      <li>
        <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          Dashboard
        </NavLink>
      </li>

      <li>
        <NavLink to="/admin/roomslist" className={({ isActive }) => (isActive ? "active" : "")}>
          Rooms
        </NavLink>
        <ul className="dropdown">
          <li>
            <Link to="/admin/roomslist">Rooms List</Link>
          </li>
          <li>
            <Link to="/admin/addroom">Add Room</Link>
          </li>
        </ul>
      </li>

      <li>
        <NavLink to="/reservations" className={({ isActive }) => (isActive ? "active" : "")}>
          Reservations
        </NavLink>
      </li>

      <li>
        <NavLink to="/factures" className={({ isActive }) => (isActive ? "active" : "")}>
          Factures
        </NavLink>
      </li>

      <li>
        <button
          type="button"
          onClick={logout}
          className="header-logout-btn"
          style={{ border: "none", background: "transparent", cursor: "pointer" }}
        >
          Logout
        </button>
      </li>
    </ul>
  );

  const ReceptionMenu = () => (
    <ul>
      <li>
        <NavLink to="/reception/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          Dashboard
        </NavLink>
      </li>

      <li>
        <NavLink to="/reception/booking" className={({ isActive }) => (isActive ? "active" : "")}>
          Booking
        </NavLink>
      </li>

      <li>
        <NavLink to="/reception/pending" className={({ isActive }) => (isActive ? "active" : "")}>
          Pending Requests
        </NavLink>
      </li>

      <li>
        <button
          type="button"
          onClick={logout}
          className="header-logout-btn"
          style={{ border: "none", background: "transparent", cursor: "pointer" }}
        >
          Logout
        </button>
      </li>
    </ul>
  );

  // ✅ Same logic style as Aside: read fresh auth in render
  const currentAuth = getAuth();
  const role = currentAuth?.user?.role || null;

  // ✅ Add role-based class so CSS can style client vs staff differently
  const headerRoleClass =
    role === "ADMIN" || role === "RECEPTIONNIST" ? "header-staff" : "header-client";

  return (
    <header className={`header-section ${headerRoleClass}`}>
      <div className="menu-item">
        <div className="container">
          <div className="row">
            <div className="col-lg-2">
              <div className="logo">
                {!role && <Link to="/">
                  <img src="/src/images/logo.png" alt="logo" />
                </Link>}
                {role === "ADMIN" && <Link to="/">
                  <img src="/src/images/footer-logo.png" alt="logo" />
                </Link>}
                {role === "RECEPTIONNIST" && <Link to="/">
                  <img src="/src/images/footer-logo.png" alt="logo" />
                </Link>}
              </div>
            </div>

            <div className="col-lg-10">
              <div className="nav-menu">
                <nav className="mainmenu">
                  {!role && <PublicMenu />}
                  {role === "ADMIN" && <AdminMenu />}
                  {role === "RECEPTIONNIST" && <ReceptionMenu />}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
