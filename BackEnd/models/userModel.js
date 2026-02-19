const mongoose = require("mongoose");
const USER_ROLES = ["ADMIN", "RECEPTIONNIST"];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
      default: "RECEPTIONNIST",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
