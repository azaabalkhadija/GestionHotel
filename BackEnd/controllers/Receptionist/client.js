const Client = require("../../models/clientModel");


exports.getAllClients = async (req, res) => {
  try {
    const { q } = req.query;

    const filter = {};
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { nomComplet: regex },
        { telephone: regex },
        { email: regex },
        { numeroPiece: regex },
      ];
    }

    const clients = await Client.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(clients);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// GET /api/reception/clients/:id
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client introuvable." });

    return res.status(200).json(client);
  } catch (err) {
    return res.status(400).json({ message: "ID invalide", error: err.message });
  }
};

