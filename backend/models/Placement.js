const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  package: { type: Number, min: 0 },
  offerDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["Offered", "Joined", "Declined"], default: "Offered" }
}, { timestamps: true });

module.exports = mongoose.model("Placement", placementSchema);
