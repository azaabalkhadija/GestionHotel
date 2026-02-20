import axios from "axios";

// GET /api/client/reservations/disponibilite?dateArrivee=...&dateDepart=...&typeChambre=...&nbPersonnes=...
export const checkAvailabilityClient = async ({ dateArrivee, dateDepart, typeChambre, nbPersonnes }) => {
  const response = await axios.get(
    "http://localhost:4000/api/client/disponibilite",
    { params: { dateArrivee, dateDepart, typeChambre, nbPersonnes } }
  );

  if (response.data && response.status === 200) return response.data;
};

export const createReservationClient = async (payload) => {
  const response = await axios.post(
    "http://localhost:4000/api/client/reservations/create",
    payload
  );

  if (response.data && (response.status === 200 || response.status === 201)) return response.data;
};
