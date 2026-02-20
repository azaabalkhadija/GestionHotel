import "../../css/roomslist.css";
import Layout from "../../components/Layout";
import { getAuth } from "../../services/global";
import { useState, useEffect } from "react";
import { getRooms, deleteRoom } from "../../services/admin";
import { useNavigate } from "react-router-dom";

const RoomsList = () => {
  const [rooms, setRooms] = useState([]);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.user.role !== "ADMIN") {
      navigate("/login", { replace: true });
      return;
    }

    setAllowed(true);

    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        setRooms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, [navigate]);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevents row click navigation
    try {
      await deleteRoom(id);
      setRooms((prev) => prev.filter((room) => room._id !== id));
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  if (!allowed) return null;

  return (
    <Layout>
      <div className="users-list-container">
        <h2>Rooms List</h2>

        <table className="Userstable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Numero</th>
              <th>Type</th>
              <th>Capacité</th>
              <th>Prix/Nuit</th>
              <th>Etat</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {rooms.map((room) => (
              <tr
                key={room._id}
                className="click-row"
                onClick={() => navigate(`/admin/rooms/${room._id}`)}
                title="Click to open room details"
              >
                <td>{room._id}</td>
                <td className="cell-strong">{room.numero}</td>
                <td>{room.type}</td>
                <td>{room.capacite}</td>
                <td>{room.prixNuit}</td>
                <td>{room.etat || "—"}</td>
                <td>
                  <div className="Actionbutton">
                    <button onClick={(e) => handleDelete(e, room._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rooms.length === 0 && (
              <tr>
                <td colSpan="7" className="rooms-empty">
                  No rooms found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default RoomsList;
