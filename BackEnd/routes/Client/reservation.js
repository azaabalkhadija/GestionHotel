const express = require('express');
const router = express.Router();
const {checkDisponibilite,createReservationClient,getStatutReservation}= require('../../controllers/Client/reservation')



router.get("/disponibilite",checkDisponibilite);
router.post("/reservations/create",createReservationClient);
router.get("/reservations/:id/statut",getStatutReservation);


module.exports = router;