import { NavLink, useNavigate } from "react-router-dom";
import "../css/aside.css";
import Profpic from "../images/téléchargement.png";
import { getAuth } from "../services/global";
import { useMemo, useEffect } from "react";

const Aside = () => {
  const navigate = useNavigate();

  // ✅ No "null first render" => no flicker
  const auth = useMemo(() => getAuth(), []);

  // Optional: if somehow auth is missing, redirect once
  useEffect(() => {
    if (!auth) navigate("/login", { replace: true });
  }, [auth, navigate]);

  if (!auth) return null;

  const role = auth?.user?.role || auth?.role;
  const isAdmin = role === "ADMIN";

  return (
    <div className="sidebaraside">
      {/* ====== ADMIN ====== */}
      {isAdmin ? (
        <>
          <div className="profileaside">
            <div className="admin-avatar">A</div>

            <div className="profile-infoaside">
              <div className="role-badge">ADMIN</div>
            </div>
          </div>

          <div className="divideraside" />

          <ul className="sidebar-menuaside">
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                <span className="iconwrap">
                  <i className="fa fa-gauge-high"></i>
                </span>
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/roomslist"
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                <span className="iconwrap">
                  <i className="fa fa-bed"></i>
                </span>
                <span>Rooms List</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/reservations"
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                <span className="iconwrap">
                  <i className="fa fa-calendar-check"></i>
                </span>
                <span>Reservations List</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/factures"
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                <span className="iconwrap">
                  <i className="fa fa-file-invoice"></i>
                </span>
                <span>Facturations List</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/clients"
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                <span className="iconwrap">
                  <i className="fa fa-user-plus"></i>
                </span>
                <span>Clients List</span>
              </NavLink>
            </li>
          </ul>
        </>
      ) : (
        /* ====== RECEPTION ====== */
        <>
          <div className="profileaside">
            <img src={Profpic} alt="Profile" className="profile-picaside" />

            <div className="profile-infoaside">
              <div className="username">{auth?.user?.firstName || ""}</div>
              <div className="role-badge">RECEPTION</div>
            </div>
          </div>

          <div className="divideraside" />

          <ul className="sidebar-menuaside">
            <li>
              <NavLink
                to="/reception/dashboard"
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                <span className="iconwrap">
                  <i className="fa-regular fa-user"></i>
                </span>
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/reception/booking"
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                <span className="iconwrap">
                  <i className="fa-regular fa-plus-square"></i>
                </span>
                <span>Add reservation</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/reception/pending"
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                <span className="iconwrap">
                  <i className="fa-regular fa-calendar-check"></i>
                </span>
                <span>Reservations requests</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/factures"
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                <span className="iconwrap">
                  <i className="fa-regular fa-calendar-check"></i>
                </span>
                <span>facturations list</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/reservations"
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                <span className="iconwrap">
                  <i className="fa-regular fa-calendar-check"></i>
                </span>
                <span>Reservations list</span>
              </NavLink>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default Aside;
