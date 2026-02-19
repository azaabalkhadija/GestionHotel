const request = require("supertest");
const jwt = require("jsonwebtoken");

// Mock the controller used by routes/Admin/chambre.js
jest.mock("../controllers/Admin/chambre", () => ({
  createChambre: (req, res) => res.status(201).json({ ok: true, action: "createChambre" }),
  getAllChambres: (req, res) => res.status(200).json({ ok: true, action: "getAllChambres", data: [] }),
  getChambreById: (req, res) => res.status(200).json({ ok: true, action: "getChambreById", id: req.params.id }),
  updateChambre: (req, res) => res.status(200).json({ ok: true, action: "updateChambre", id: req.params.id }),
  deleteChambre: (req, res) => res.status(200).json({ ok: true, action: "deleteChambre", id: req.params.id }),
  setEtatChambre: (req, res) => res.status(200).json({ ok: true, action: "setEtatChambre", id: req.params.id }),
}));

// ⚠️ Import app AFTER mocks
const app = require("../app");

describe("Admin Chambre routes (integration) - /api/rooms", () => {
  const BASE = "/api/rooms";

  const makeToken = (role) => {
    process.env.TOKEN_ENCODED = "test_secret";
    return jwt.sign(
      { userId: "u1", role, email: `${role.toLowerCase()}@test.com` },
      process.env.TOKEN_ENCODED
    );
  };

  const adminToken = () => makeToken("ADMIN");
  const clientToken = () => makeToken("CLIENT");

  // Optional: if your app connects to Mongo on import and Jest hangs, uncomment:
  // afterAll(async () => {
  //   const mongoose = require("mongoose");
  //   await mongoose.connection.close();
  // });

  test("GET /getallrooms should return 200", async () => {
    const res = await request(app).get(`${BASE}/getallrooms`);
    expect(res.statusCode).toBe(200);
    expect(res.body.action).toBe("getAllChambres");
  });

  // ---------- GET by id ----------
  test("GET /getroom/:id without token -> 401", async () => {
    const res = await request(app).get(`${BASE}/getroom/123`);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "No token provided" });
  });

  test("GET /getroom/:id with CLIENT -> 403", async () => {
    const res = await request(app)
      .get(`${BASE}/getroom/123`)
      .set("Authorization", `Bearer ${clientToken()}`);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: "Forbidden: insufficient role" });
  });

  test("GET /getroom/:id with ADMIN -> 200", async () => {
    const res = await request(app)
      .get(`${BASE}/getroom/123`)
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.action).toBe("getChambreById");
    expect(res.body.id).toBe("123");
  });

  // ---------- POST addroom ----------
  test("POST /addroom without token -> 401", async () => {
    const res = await request(app).post(`${BASE}/addroom`).send({ numero: "101" });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "No token provided" });
  });

  test("POST /addroom with CLIENT -> 403", async () => {
    const res = await request(app)
      .post(`${BASE}/addroom`)
      .set("Authorization", `Bearer ${clientToken()}`)
      .send({ numero: "101" });
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: "Forbidden: insufficient role" });
  });

  test("POST /addroom with ADMIN -> 201", async () => {
    const res = await request(app)
      .post(`${BASE}/addroom`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({
        numero: "101",
        type: "SINGLE",
        prix: 300,
        etat: "LIBRE",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.action).toBe("createChambre");
  });

  // ---------- PUT updateroom ----------
  test("PUT /updateroom/:id without token -> 401", async () => {
    const res = await request(app).put(`${BASE}/updateroom/123`).send({ prix: 350 });
    expect(res.statusCode).toBe(401);
  });

  test("PUT /updateroom/:id with CLIENT -> 403", async () => {
    const res = await request(app)
      .put(`${BASE}/updateroom/123`)
      .set("Authorization", `Bearer ${clientToken()}`)
      .send({ prix: 350 });
    expect(res.statusCode).toBe(403);
  });

  test("PUT /updateroom/:id with ADMIN -> 200", async () => {
    const res = await request(app)
      .put(`${BASE}/updateroom/123`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ prix: 350 });

    expect(res.statusCode).toBe(200);
    expect(res.body.action).toBe("updateChambre");
    expect(res.body.id).toBe("123");
  });

  // ---------- DELETE delete ----------
  test("DELETE /delete/:id without token -> 401", async () => {
    const res = await request(app).delete(`${BASE}/delete/123`);
    expect(res.statusCode).toBe(401);
  });

  test("DELETE /delete/:id with CLIENT -> 403", async () => {
    const res = await request(app)
      .delete(`${BASE}/delete/123`)
      .set("Authorization", `Bearer ${clientToken()}`);
    expect(res.statusCode).toBe(403);
  });

  test("DELETE /delete/:id with ADMIN -> 200", async () => {
    const res = await request(app)
      .delete(`${BASE}/delete/123`)
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.action).toBe("deleteChambre");
    expect(res.body.id).toBe("123");
  });

  // ---------- PATCH etat ----------
  test("PATCH /:id/etat without token -> 401", async () => {
    const res = await request(app).patch(`${BASE}/123/etat`).send({ etat: "OCCUPE" });
    expect(res.statusCode).toBe(401);
  });

  test("PATCH /:id/etat with CLIENT -> 403", async () => {
    const res = await request(app)
      .patch(`${BASE}/123/etat`)
      .set("Authorization", `Bearer ${clientToken()}`)
      .send({ etat: "OCCUPE" });
    expect(res.statusCode).toBe(403);
  });

  test("PATCH /:id/etat with ADMIN -> 200", async () => {
    const res = await request(app)
      .patch(`${BASE}/123/etat`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ etat: "OCCUPE" });

    expect(res.statusCode).toBe(200);
    expect(res.body.action).toBe("setEtatChambre");
    expect(res.body.id).toBe("123");
  });
  afterAll(async () => {
  const mongoose = require("mongoose");
  await mongoose.connection.close();
});

});
