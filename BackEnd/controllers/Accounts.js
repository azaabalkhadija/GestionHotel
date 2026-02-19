// controllers/userController.js
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

function buildUserSafe(user) {
  return {
    _id: user._id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

exports.signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "email, password and role are required" });
    }


    const allowedRoles = ["ADMIN", "RECEPTIONNIST"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      email: email.toLowerCase(),
      role,
      password: hash,
    });

    await user.save();

    const token = jwt.sign(
      { email: user.email, userId: user._id, role: user.role },
      process.env.TOKEN_ENCODED,
      { expiresIn: "24h" } 
    );

    return res.status(201).json({
      user: buildUserSafe(user),
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Auth failed" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Auth failed" });

    const token = jwt.sign(
      { email: user.email, userId: user._id, role: user.role },
      process.env.TOKEN_ENCODED,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      user: buildUserSafe(user),
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


exports.me = async (req, res) => {
  try {
    // req.auth comes from auth middleware
    return res.status(200).json({
      user: req.auth,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
