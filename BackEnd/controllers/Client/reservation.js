
const Reservation = require("../../models/reservationModel");
const Client = require("../../models/clientModel");
const Chambre = require("../../models/chambreModel");

const STATUTS_OCCUPATION = ["CONFIRMEE", "EN_COURS"];

async function findAvailableRoom({ typeChambre, nbPersonnes, dateArrivee, dateDepart }) {
  // candidate rooms
  const candidates = await Chambre.find({
    type: typeChambre,
    capacite: { $gte: nbPersonnes },
    etat: "DISPONIBLE",
  }).sort({ numero: 1 });

  if (!candidates.length) return null;

  // check conflicts for each room
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
      return res.status(400).json({
        message: "Champs requis: dateArrivee, dateDepart, typeChambre, nbPersonnes",
      });
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


// 2) Create reservation by client (EN_LIGNE -> EN_ATTENTE)

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

// 2) Create reservation by client (EN_LIGNE -> EN_ATTENTE)

exports.createReservationClient = async (req, res) => {
  try {
    const { dateArrivee, dateDepart, nbPersonnes, typeChambre, client } = req.body;

    // Required reservation fields
    if (!dateArrivee || !dateDepart || !nbPersonnes || !typeChambre) {
      return res.status(400).json({
        message: "Champs requis: dateArrivee, dateDepart, nbPersonnes, typeChambre",
      });
    }

    // Required client fields
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

    // Normalize
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

    // Find or create client atomically
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

    // Create reservation (client: EN_ATTENTE, no room assigned)
    // generateReservationNumber(), and retry if duplicate numeroReservation
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
          canal: "EN_LIGNE",
          statut: "EN_ATTENTE",
          chambreAffectee: null,
          dateAffectation: null,
        });

        return res.status(201).json(reservation);
      } catch (err) {
        // retry only when the conflict is the reservation number
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
        message: "Conflit (duplicate key).",
        keyPattern: err.keyPattern,
        keyValue: err.keyValue,
      });
    }
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getStatutReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id)
      .populate("chambreAffectee", "numero type prixNuit")
      .select("numeroReservation statut canal chambreAffectee dateArrivee dateDepart createdAt updatedAt");

    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    return res.status(200).json(reservation);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
