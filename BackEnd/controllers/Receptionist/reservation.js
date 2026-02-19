
const Reservation = require("../../models/reservationModel");
const Client = require("../../models/clientModel");
const Chambre = require("../../models/chambreModel");
const Facture = require("../../models/factureModel");

const STATUTS_OCCUPATION = ["CONFIRMEE", "EN_COURS"];

function normalizeDate(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function nightsBetween(dateArrivee, dateDepart) {
  const start = normalizeDate(dateArrivee);
  const end = normalizeDate(dateDepart);
  const diff = end - start;
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

async function generateReservationNumber() {
  const year = new Date().getFullYear();
  const prefix = `RES-${year}-`;

  // get last reservation for this year
  const last = await Reservation.findOne({ numeroReservation: { $regex: `^${prefix}` } })
    .sort({ numeroReservation: -1 })
    .select("numeroReservation")
    .lean();

  let next = 1;

  if (last?.numeroReservation) {
    const lastNum = parseInt(last.numeroReservation.replace(prefix, ""), 10);
    if (!Number.isNaN(lastNum)) next = lastNum + 1;
  }

  return `${prefix}${String(next).padStart(6, "0")}`;
}

async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;

  // get last invoice for this year 
  const last = await Facture.findOne({ numeroFacture: { $regex: `^${prefix}` } })
    .sort({ numeroFacture: -1 })
    .select("numeroFacture")
    .lean();

  let next = 1;

  if (last?.numeroFacture) {
    const lastNum = parseInt(last.numeroFacture.replace(prefix, ""), 10);
    if (!Number.isNaN(lastNum)) next = lastNum + 1;
  }

  return `${prefix}${String(next).padStart(6, "0")}`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfTomorrow() {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

async function findAvailableRoom({ typeChambre, nbPersonnes, dateArrivee, dateDepart }) {

  const candidates = await Chambre.find({
    type: typeChambre,
    capacite: { $gte: nbPersonnes },
    etat: "DISPONIBLE",
  }).sort({ numero: 1 });

  if (!candidates.length) return null;


  for (const room of candidates) {
    const conflict = await Reservation.findOne({
      chambreAffectee: room._id,
      statut: { $in: STATUTS_OCCUPATION },
      dateArrivee: { $lt: new Date(dateDepart) },
      dateDepart: { $gt: new Date(dateArrivee) },
    }).lean();

    if (!conflict) return room;
  }

  return null;
}

exports.checkDisponibilite = async (req, res) => {
  try {
    const { dateArrivee, dateDepart, typeChambre, nbPersonnes } = req.query;

    if (!dateArrivee || !dateDepart || !typeChambre || !nbPersonnes) {
      return res.status(400).json({ message: "Champs requis: dateArrivee, dateDepart, typeChambre, nbPersonnes" });
    }

    const room = await findAvailableRoom({
      typeChambre,
      nbPersonnes: Number(nbPersonnes),
      dateArrivee,
      dateDepart,
    });

    if (!room) return res.status(200).json({ disponible: false });

    return res.status(200).json({ disponible: true, prixNuit: room.prixNuit });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.createReservationReception = async (req, res) => {
  try {
    const { dateArrivee, dateDepart, nbPersonnes, typeChambre, client } = req.body;

    // 1) Validate reservation fields
   
    if (!dateArrivee || !dateDepart || !nbPersonnes || !typeChambre) {
      return res.status(400).json({
        message: "Champs requis: dateArrivee, dateDepart, nbPersonnes, typeChambre",
      });
    }

    // 2) Validate client fields

    if (
      !client?.nomComplet ||
      !client?.telephone ||
      !client?.email ||
      !client?.typePiece ||
      !client?.numeroPiece
    ) {
      return res.status(400).json({
        message:
          "Infos client requises: nomComplet, telephone, email, typePiece, numeroPiece",
      });
    }

    // 3) Normalize

    const nomComplet = String(client.nomComplet).trim();
    const telephone = String(client.telephone).trim();
    const email = String(client.email).trim().toLowerCase();
    const typePiece = String(client.typePiece).trim().toUpperCase();
    const numeroPiece = String(client.numeroPiece).trim().toUpperCase();

    if (!nomComplet || !telephone || !email || !typePiece || !numeroPiece) {
      return res.status(400).json({
        message:
          "Infos client invalides: aucun champ ne doit être vide (nomComplet, telephone, email, typePiece, numeroPiece).",
      });
    }

    // 4) Find or create client atomically (same robust logic as client method)

    let dbClient;
    try {
      dbClient = await Client.findOneAndUpdate(
        { typePiece, numeroPiece },
        { $set: { nomComplet, telephone, email } },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({
          message:
            "Conflit: un client avec ces informations existe déjà (ex: email déjà utilisé).",
          keyPattern: err.keyPattern,
          keyValue: err.keyValue,
        });
      }
      throw err;
    }

    // 5) Assign room automatically (checks overlap conflicts)
 
    const room = await findAvailableRoom({
      typeChambre,
      nbPersonnes: Number(nbPersonnes),
      dateArrivee,
      dateDepart,
    });

    if (!room) {
      return res
        .status(409)
        .json({ message: "Aucune chambre disponible pour ces critères." });
    }

    // 6) Create reservation with retry if numeroReservation duplicates
    //   uses your existing generateReservationNumber() method

    let reservation;

    for (let attempt = 1; attempt <= 5; attempt++) {
      const numeroReservation = await generateReservationNumber();

      try {
        reservation = await Reservation.create({
          numeroReservation,
          client: dbClient._id,
          dateArrivee,
          dateDepart,
          nbPersonnes: Number(nbPersonnes),
          typeChambre,
          canal: "SUR_PLACE",
          statut: "CONFIRMEE",
          chambreAffectee: room._id,
          dateAffectation: new Date(),
        });

        return res.status(201).json(reservation);
      } catch (err) {
        // Retry only if the duplicate is on numeroReservation
        if (err?.code === 11000 && err?.keyPattern?.numeroReservation) {
          if (attempt === 5) {
            return res.status(409).json({
              message: "Conflit: numéro de réservation déjà utilisé, réessayez.",
              keyPattern: err.keyPattern,
              keyValue: err.keyValue,
            });
          }
          continue;
        }
        throw err;
      }
    }
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "Conflit (donnée unique déjà existante).",
        keyPattern: err.keyPattern,
        keyValue: err.keyValue,
      });
    }
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};


exports.getDemandesEnAttente = async (req, res) => {
  try {
    const demandes = await Reservation.find({ statut: "EN_ATTENTE", canal: "EN_LIGNE" })
      .populate("client", "nomComplet telephone email")
      .sort({ createdAt: -1 });

    return res.status(200).json(demandes);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.confirmerReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable." });

    // Only confirm if EN_ATTENTE (online request)
    if (reservation.statut !== "EN_ATTENTE") {
      return res.status(400).json({ message: "Confirmation possible seulement si réservation EN_ATTENTE." });
    }

    const room = await findAvailableRoom({
      typeChambre: reservation.typeChambre,
      nbPersonnes: reservation.nbPersonnes,
      dateArrivee: reservation.dateArrivee,
      dateDepart: reservation.dateDepart,
    });

    if (!room) return res.status(409).json({ message: "Aucune chambre disponible pour confirmer." });

    reservation.statut = "CONFIRMEE";
    reservation.chambreAffectee = room._id;
    reservation.dateAffectation = new Date();
    await reservation.save();

    return res.status(200).json(reservation);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.annulerReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable." });

    if (["EN_COURS", "TERMINEE"].includes(reservation.statut)) {
      return res.status(400).json({ message: "Impossible d'annuler une réservation en cours/terminée." });
    }

    reservation.statut = "ANNULEE";
    await reservation.save();

    return res.status(200).json(reservation);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable." });

    if (reservation.statut !== "CONFIRMEE") {
      return res.status(400).json({ message: "Check-in possible seulement si réservation CONFIRMEE." });
    }

    // Normally already assigned on confirmation/reception creation,
    // but fallback for safety
    if (!reservation.chambreAffectee) {
      const room = await findAvailableRoom({
        typeChambre: reservation.typeChambre,
        nbPersonnes: reservation.nbPersonnes,
        dateArrivee: reservation.dateArrivee,
        dateDepart: reservation.dateDepart,
      });
      if (!room) return res.status(409).json({ message: "Aucune chambre disponible pour check-in." });

      reservation.chambreAffectee = room._id;
      reservation.dateAffectation = new Date();
    }

    reservation.statut = "EN_COURS";
    await reservation.save();

    return res.status(200).json(reservation);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id).populate("chambreAffectee");
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable." });

    if (reservation.statut !== "EN_COURS") {
      return res.status(400).json({ message: "Check-out possible seulement si réservation EN_COURS." });
    }

    if (!reservation.chambreAffectee) {
      return res.status(400).json({ message: "Aucune chambre affectée à cette réservation." });
    }

    const nbNuits = nightsBetween(reservation.dateArrivee, reservation.dateDepart);
    const prixNuit = reservation.chambreAffectee.prixNuit;
    const total = nbNuits * prixNuit;

    const numeroFacture = await generateInvoiceNumber();

    const facture = await Facture.create({
      numeroFacture,
      reservation: reservation._id,
      nbNuits,
      prixNuit,
      total,
      dateFacture: new Date(),
    });

    reservation.statut = "TERMINEE";
    await reservation.save();

    return res.status(200).json({ reservation, facture });
  } catch (err) {
     console.log("CHECKOUT ERROR:", err);
  return res.status(500).json({ message: "Erreur serveur", error: err.message, keyValue: err.keyValue });
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getCheckinsAujourdhui = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const reservations = await Reservation.find({
      statut: "CONFIRMEE",
      dateArrivee: { $gte: start, $lte: end },
      canal: { $in: ["SUR_PLACE", "EN_LIGNE"] }, // optional filter
    })
      .populate("client", "nomComplet telephone email typePiece numeroPiece")
      .populate("chambreAffectee", "numero type prixNuit")
      .sort({ dateArrivee: 1 });

    return res.status(200).json(reservations);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
exports.getCheckoutsAujourdhui = async (req, res) => {
  try {
    const from = startOfToday();
    const to = startOfTomorrow();

    const reservations = await Reservation.find({
      dateDepart: { $gte: from, $lt: to },
      statut: { $in: ["CONFIRMEE", "EN_COURS", "TERMINEE"] },
    })
      .populate("client", "nomComplet telephone email typePiece numeroPiece")
      .populate("chambreAffectee", "numero type prixNuit capacite")
      .sort({ dateDepart: 1 });

    // map reservationId -> factureId
    const ids = reservations.map((r) => r._id);
    const factures = await Facture.find({ reservation: { $in: ids } })
      .select("_id reservation")
      .lean();

    const map = new Map(factures.map((f) => [String(f.reservation), String(f._id)]));

    const out = reservations.map((r) => ({
      ...r.toObject(),
      factureId: map.get(String(r._id)) || null,
    }));

    return res.status(200).json(out);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const { statut, canal, from, to, typeChambre } = req.query;

    const filter = {};
    if (statut) filter.statut = statut;
    if (canal) filter.canal = canal;
    if (typeChambre) filter.typeChambre = typeChambre;

    // Filtrer par période (optionnel)
    if (from || to) {
      // Ici: on filtre sur dateArrivee (simple)
      filter.dateArrivee = {};
      if (from) filter.dateArrivee.$gte = new Date(from);
      if (to) filter.dateArrivee.$lte = new Date(to);
    }

    const reservations = await Reservation.find(filter)
      .populate("client", "nomComplet telephone email")
      .populate("chambreAffectee", "numero type capacite prixNuit")
      .sort({ createdAt: -1 });

    return res.status(200).json(reservations);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id)
      .populate("client", "nomComplet telephone email typePiece numeroPiece")
      .populate("chambreAffectee", "numero type capacite prixNuit etat")
      .lean();

    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    return res.status(200).json(reservation);
  } catch (err) {
    return res.status(400).json({ message: "ID invalide", error: err.message });
  }
};
