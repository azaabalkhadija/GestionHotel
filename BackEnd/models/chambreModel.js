const mongoose = require("mongoose");

const ETATS_CHAMBRE = ["DISPONIBLE", "MAINTENANCE"];
const TYPE_CHAMBRE = ["SINGLE", "DOUBLE","TWIN","FAMILY"];

const chambreSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, trim: true, unique: true }, 
    type: { type: String, enum: TYPE_CHAMBRE, required: true, trim: true }, 
    capacite: { type: Number, required: true, min: 1 },               
    prixNuit: { type: Number, required: true, min: 0 },
    etat: { type: String, enum: ETATS_CHAMBRE, default: "DISPONIBLE" },
  },
  { timestamps: true }
);

chambreSchema.index({ type: 1, capacite: 1, etat: 1 });

module.exports = mongoose.model("Chambre", chambreSchema);
