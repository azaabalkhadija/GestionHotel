const express = require("express");
const router = express.Router();
const {getAllClients,getClientById} = require("../../controllers/Admin/client");
const auth = require('../../middlewares/auth')
const authorize = require("../../middlewares/authorize");
        
router.get("/getallclients",auth,authorize("ADMIN"), getAllClients);          // GET  /api/chambres?type=&etat=&capaciteMin=      
router.get("/getclient/:id",auth,authorize("ADMIN"), getClientById);       


module.exports = router;
