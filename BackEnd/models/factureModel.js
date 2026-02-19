const mongoose = require("mongoose");

const factureSchema = new mongoose.Schema(
  {
    numeroFacture: { type: String, required: true, unique: true, trim: true },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation", required: true, unique: true },

    dateFacture: { type: Date, default: Date.now },

    nbNuits: { type: Number, required: true, min: 1 },
    prixNuit: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

factureSchema.index({ dateFacture: -1 });

module.exports = mongoose.model("Facture", factureSchema);
