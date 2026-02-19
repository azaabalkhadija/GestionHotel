const Facture = require("../../models/factureModel");

exports.getAllFactures = async (req, res) => {
  try {
    const { from, to, q, numeroFacture, numeroReservation } = req.query;

  
    const filter = {};

    // Date range 
    if (from || to) {
      filter.dateFacture = {};
      if (from) filter.dateFacture.$gte = new Date(from);
      if (to) filter.dateFacture.$lte = new Date(to);
    }

    // Filter by facture number
    if (numeroFacture) {
      filter.numeroFacture = { $regex: String(numeroFacture).trim(), $options: "i" };
    }

    const facturesRaw = await Facture.find(filter)
      .populate({
        path: "reservation",
        select:
          "numeroReservation dateArrivee dateDepart statut typeChambre nbPersonnes chambreAffectee client",
        populate: [
          { path: "client", select: "nomComplet telephone email typePiece numeroPiece" },
          { path: "chambreAffectee", select: "numero type prixNuit capacite" },
        ],
      })
      .sort({ createdAt: -1 });

    // Post-filter for reservation number and client name (because they are in populated docs)
    let factures = facturesRaw;

    if (numeroReservation) {
      const nr = String(numeroReservation).trim().toLowerCase();
      factures = factures.filter((f) =>
        String(f?.reservation?.numeroReservation || "").toLowerCase().includes(nr)
      );
    }

    if (q) {
      const needle = String(q).trim().toLowerCase();
      factures = factures.filter((f) =>
        String(f?.reservation?.client?.nomComplet || "").toLowerCase().includes(needle)
      );
    }

    return res.status(200).json(factures);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getFactureById = async (req, res) => {
  try {
    const { id } = req.params;

    const facture = await Facture.findById(id).populate({
      path: "reservation",
      select:
        "numeroReservation dateArrivee dateDepart statut typeChambre nbPersonnes chambreAffectee client",
      populate: [
        { path: "client", select: "nomComplet telephone email typePiece numeroPiece" },
        { path: "chambreAffectee", select: "numero type prixNuit capacite" },
      ],
    });

    if (!facture) return res.status(404).json({ message: "Facture introuvable." });

    return res.status(200).json(facture);
  } catch (err) {
    return res.status(400).json({ message: "ID invalide", error: err.message });
  }
};
