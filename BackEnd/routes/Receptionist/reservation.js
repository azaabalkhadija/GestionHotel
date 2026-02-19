// routes/Reception/reservation.js
const express = require("express");
const router = express.Router();

const {
  checkDisponibilite,
  createReservationReception,
  getDemandesEnAttente,
  confirmerReservation,
  annulerReservation,
  checkIn,
  checkOut,
  getCheckinsAujourdhui,
  getCheckoutsAujourdhui,
  getAllReservations,
  getReservationById,
} = require("../../controllers/Receptionist/reservation");

const auth = require("../../middlewares/auth");
// GET /api/reception/reservations/disponibilite?dateArrivee=...&dateDepart=...&typeChambre=...&nbPersonnes=...
router.get("/disponibilite", auth, checkDisponibilite);
router.post("/create", auth, createReservationReception);
router.get("/en-attente", auth, getDemandesEnAttente);
router.get("/getallreservations", auth, getAllReservations);
router.get("/checkins-aujourdhui", auth, getCheckinsAujourdhui);
router.get("/checkouts-aujourdhui", auth, getCheckoutsAujourdhui);
router.get("/:id", auth, getReservationById);
router.patch("/:id/confirmer", auth, confirmerReservation);
router.patch("/:id/annuler", auth, annulerReservation);
router.patch("/:id/checkin",checkIn);
router.patch("/:id/checkout", auth, checkOut);

module.exports = router;
