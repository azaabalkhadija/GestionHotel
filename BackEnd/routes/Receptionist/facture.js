const express = require('express');
const router = express.Router();
const {getAllFactures,getFactureById}= require('../../controllers/Receptionist/facture')
const auth = require('../../middlewares/auth')

router.get('/factureslist',auth, getAllFactures);
router.get('/:id',auth, getFactureById);



module.exports = router;