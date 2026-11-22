require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Student = require("./models/Student");
const Company = require("./models/Company");

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Student Placement Management System" });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/placements", require("./routes/placementRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

app.use(express.static(path.join(__dirname, "..", "frontend")));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) return next();
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.use((req, res) => res.status(404).json({ message: "API route not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(", ") });
  }
  if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ message: "Resume must be 5 MB or smaller" });
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@placement.edu";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({
      name: "Placement Administrator",
      email,
      password: await bcrypt.hash(password, 12),
      role: "admin"
    });
    console.log(`Seeded admin: ${email} / ${password}`);
  }
}

async function start() {
  await connectDB();
  await seedAdmin();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
}

if (require.main === module) start().catch(error => {
  console.error(error.message);
  process.exit(1);
});

module.exports = app;
