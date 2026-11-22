const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  companyName: { type: String, required: true, trim: true },
  industry: String,
  website: String,
  phone: String,
  address: String,
  description: String
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);
