const mongoose = require("mongoose");

const TYPE_PIECE = ["CIN", "PASSPORT"];

const clientSchema = new mongoose.Schema(
  {
    nomComplet: { type: String, required: true, trim: true },
    telephone: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },
    typePiece: { type: String, enum: TYPE_PIECE ,required: true,},
    numeroPiece: { type: String, trim: true ,required: true,},
  },
  { timestamps: true }
);

// éviter doublons basiques sur téléphone
clientSchema.index({ telephone: 1 });

module.exports = mongoose.model("Client", clientSchema);
