const Chambre = require("../../models/chambreModel");

// CREATE - Admin ajoute une chambre
exports.createChambre = async (req, res) => {
  try {
    const { numero, type, capacite, prixNuit, etat } = req.body;

    // Validation 
    if (!numero || !type || capacite == null || prixNuit == null) {
      return res.status(400).json({ message: "Champs requis: numero, type, capacite, prixNuit" });
    }

    const chambre = await Chambre.create({
      numero,
      type,
      capacite,
      prixNuit,
      ...(etat ? { etat } : {}),
    });

    return res.status(201).json(chambre);
  } catch (err) {
    // Gestion erreur unicité numero
    if (err.code === 11000) {
      return res.status(409).json({ message: "Le numéro de chambre existe déjà." });
    }
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// liste des chambres (avec filtres)
exports.getAllChambres = async (req, res) => {
  try {
    const { type, etat, capaciteMin } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (etat) filter.etat = etat;
    if (capaciteMin) filter.capacite = { $gte: Number(capaciteMin) };

    const chambres = await Chambre.find(filter).sort({ numero: 1 });
    return res.json(chambres);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// récupère une chambre par id
exports.getChambreById = async (req, res) => {
  try {
    const { id } = req.params;

    const chambre = await Chambre.findById(id);
    if (!chambre) return res.status(404).json({ message: "Chambre introuvable." });

    return res.json(chambre);
  } catch (err) {
    return res.status(400).json({ message: "ID invalide", error: err.message });
  }
};

//  Admin modifie une chambre
exports.updateChambre = async (req, res) => {
  try {
    const { id } = req.params;

    // Pour éviter qu'on modifie n'importe quoi, on whiteliste les champs
    const allowedFields = ["numero", "type", "capacite", "prixNuit", "etat"];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const chambre = await Chambre.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!chambre) return res.status(404).json({ message: "Chambre introuvable." });

    return res.json(chambre);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Le numéro de chambre existe déjà." });
    }
    return res.status(400).json({ message: "Requête invalide", error: err.message });
  }
};

// supprime une chambre
exports.deleteChambre = async (req, res) => {
  try {
    const { id } = req.params;

    const chambre = await Chambre.findByIdAndDelete(id);
    if (!chambre) return res.status(404).json({ message: "Chambre introuvable." });

    return res.json({ message: "Chambre supprimée avec succès." });
  } catch (err) {
    return res.status(400).json({ message: "ID invalide", error: err.message });
  }
};

//  Admin change juste l'état (DISPONIBLE / MAINTENANCE)
exports.setEtatChambre = async (req, res) => {
  try {
    const { id } = req.params;
    const { etat } = req.body;

    if (!etat) return res.status(400).json({ message: "Champ requis: etat" });

    const chambre = await Chambre.findByIdAndUpdate(
      id,
      { etat },
      { new: true, runValidators: true }
    );

    if (!chambre) return res.status(404).json({ message: "Chambre introuvable." });

    return res.json(chambre);
  } catch (err) {
    return res.status(400).json({ message: "Requête invalide", error: err.message });
  }
};
