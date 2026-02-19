const express = require("express");
const router = express.Router();

const {
  createChambre,
  getAllChambres,
  getChambreById,
  updateChambre,
  deleteChambre,
  setEtatChambre,
} = require("../../controllers/Admin/chambre");

const auth = require("../../middlewares/auth");
const authorize = require("../../middlewares/authorize");
router.get("/getallrooms", getAllChambres);
router.get("/getroom/:id",auth,authorize("ADMIN"), getChambreById);
router.post("/addroom", auth, authorize("ADMIN"), createChambre);
router.put("/updateroom/:id", auth, authorize("ADMIN"), updateChambre);
router.delete("/delete/:id", auth, authorize("ADMIN"), deleteChambre);
router.patch("/:id/etat", auth, authorize("ADMIN"), setEtatChambre);

module.exports = router;
