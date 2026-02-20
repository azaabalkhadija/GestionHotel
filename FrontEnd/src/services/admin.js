
import axios from "axios";
import { getAuth } from "./global";

const BASE = "http://localhost:4000/api";


const authConfig = () => {
  const token = getAuth()?.token;
  if (!token) throw new Error("Not authenticated: missing token in sessionStorage");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// =======================
// ROOMS
// =======================

export const getRooms = async () => {
  const response = await axios.get(`${BASE}/rooms/getallrooms`);
  if (response.data && response.status === 200) return response.data;
};

export const deleteRoom = async (id) => {
  const response = await axios.delete(
    `${BASE}/rooms/delete/${id}`,
    authConfig()
  );
  if (response.data && response.status === 200) return response.data;
};

export const addRoom = async (payload) => {
  const response = await axios.post(
    `${BASE}/rooms/addroom`,
    payload,
    {
      ...authConfig(),
      headers: {
        ...authConfig().headers,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.data && (response.status === 200 || response.status === 201)) {
    return response.data;
  }
};

export const getRoomById = async (id) => {
  const res = await axios.get(`${BASE}/rooms/getroom/${id}`, authConfig());
  if (res.data && res.status === 200) return res.data;
};

export const updateRoom = async (id, payload) => {
  const res = await axios.put(
    `${BASE}/rooms/updateroom/${id}`,
    payload,
    authConfig()
  );
  if (res.data && res.status === 200) return res.data;
};

// =======================
// Clients (ADMIN)
// =======================

export const getClients = async (q = "") => {
  const url = q
    ? `${BASE}/admin/getallclients?q=${encodeURIComponent(q)}`
    : `${BASE}/admin/getallclients`;

  const response = await axios.get(url, authConfig());

  if (response.data && response.status === 200) return response.data;
  return [];
};
