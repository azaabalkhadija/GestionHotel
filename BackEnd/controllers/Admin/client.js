const Client = require("../../models/clientModel");

// GET: liste des clients 
exports.getAllClients = async (req, res) => {
  try {
    const { q } = req.query; // recherche par nom/tel/email

    const filter = {};
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { nomComplet: regex },
        { telephone: regex },
        { email: regex },
      ];
    }

    const clients = await Client.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(clients);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// GET: détails d’un client 
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client introuvable." });

    return res.status(200).json(client);
  } catch (err) {
    return res.status(400).json({ message: "ID invalide", error: err.message });
  }
};
