
import axios from "axios";
import { getAuth } from "./global";

const API = "http://localhost:4000/api/reception/reservations";
const API2 = "http://localhost:4000/api/reception";


const authConfig = () => {
  const token = getAuth()?.token;
  if (!token) throw new Error("Not authenticated: missing token in sessionStorage");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const checkAvailability = async ({
  dateArrivee,
  dateDepart,
  typeChambre,
  nbPersonnes,
}) => {
  const response = await axios.get(`${API}/disponibilite`, {
    ...authConfig(),
    params: { dateArrivee, dateDepart, typeChambre, nbPersonnes },
  });

  if (response.data && response.status === 200) return response.data;
};

export const addReservation = async (payload) => {
  const response = await axios.post(`${API}/create`, payload, authConfig());
  if (response.data && response.status === 200) return response.data;
};

export const getTodayCheckins = async () => {
  const response = await axios.get(`${API}/checkins-aujourdhui`, authConfig());
  if (response.data && response.status === 200) return response.data;
};

export const checkInReservation = async (id) => {
  const response = await axios.patch(`${API}/${id}/checkin`, {}, authConfig());
  if (response.data && response.status === 200) return response.data;
};

export const getAllReservations = async (params = {}) => {
  const response = await axios.get(`${API}/getallreservations`, {
    ...authConfig(),
    params,
  });

  if (response.data && response.status === 200) return response.data;
};
export const getReservationById = async (id) => {
  const response = await axios.get(`${API}/${id}`, authConfig());
  if (response.data && response.status === 200) return response.data;
};

export const confirmReservation = async (id) => {
  const response = await axios.patch(`${API}/${id}/confirmer`, {}, authConfig());
  if (response.data && response.status === 200) return response.data;
};

export const getTodayCheckouts = async () => {
  const response = await axios.get(`${API}/checkouts-aujourdhui`, authConfig());
  if (response.data && response.status === 200) return response.data;
};

export const checkoutReservation = async (id) => {
  const response = await axios.patch(`${API}/${id}/checkout`, {}, authConfig());
  if (response.data && response.status === 200) return response.data;
};

export const cancelReservation = async (id) => {
  const response = await axios.patch(`${API}/${id}/annuler`, {}, authConfig());
  if (response.data && response.status === 200) return response.data;
};

// GET /api/reception/factures?from=&to=
export const getAllFactures = async (params = {}) => {
  const res = await axios.get(`http://localhost:4000/api/factures/factureslist`, {
    ...authConfig(),
    params,
  });
  return res.data;
};

// GET /api/reception/factures/:id
export const getFactureById = async (id) => {
  const res = await axios.get(`http://localhost:4000/api/factures/${id}`, authConfig());
  return res.data;
};
