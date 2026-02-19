const mongoose = require("mongoose");

const CANAUX = ["EN_LIGNE", "SUR_PLACE"];
const STATUTS = ["CREEE", "EN_ATTENTE", "CONFIRMEE", "EN_COURS", "TERMINEE", "ANNULEE"];
const TYPE_CHAMBRE = ["SINGLE", "DOUBLE","TWIN","FAMILY"];

const reservationSchema = new mongoose.Schema(
  {
    numeroReservation: { type: String, required: true, unique: true, trim: true },

    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },

    dateArrivee: { type: Date, required: true },
    dateDepart: { type: Date, required: true },

    nbPersonnes: { type: Number, required: true, min: 1 },
    typeChambre: { type: String, enum: TYPE_CHAMBRE , required: true, trim: true }, 

    canal: { type: String, enum: CANAUX, required: true },
    statut: { type: String, enum: STATUTS, required: true, default: "EN_ATTENTE" },

    chambreAffectee: { type: mongoose.Schema.Types.ObjectId, ref: "Chambre" }, // null jusqu’à confirmation 
    dateAffectation: { type: Date },
  },
  { timestamps: true }
);

// Validationdes dates
reservationSchema.pre("validate", function (next) {
  if (this.dateArrivee && this.dateDepart && this.dateDepart <= this.dateArrivee) {
    return next(new Error("dateDepart doit être > dateArrivee"));
  }
  next();
});

reservationSchema.index({ statut: 1, canal: 1 });
reservationSchema.index({ typeChambre: 1, dateArrivee: 1, dateDepart: 1 });
reservationSchema.index({ chambreAffectee: 1, dateArrivee: 1, dateDepart: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);
