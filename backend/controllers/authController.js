const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

async function registerStudent(req, res) {
  const { name, email, password, rollNumber, course, semester, phone, cgpa, skills } = req.body;
  if (!name || !email || !password || !rollNumber) {
    return res.status(400).json({ message: "Name, email, password and roll number are required" });
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    return res.status(409).json({ message: "Email is already registered" });
  }
  if (await Student.findOne({ rollNumber })) {
    return res.status(409).json({ message: "Roll number is already registered" });
  }
  const user = await User.create({
    name, email, password: await bcrypt.hash(password, 12), role: "student"
  });
  await Student.create({
    user: user._id, rollNumber, course, semester, phone, cgpa,
    skills: typeof skills === "string" ? skills.split(",").map(s => s.trim()).filter(Boolean) : skills || []
  });
  res.status(201).json({ token: signToken(user), user: { id: user._id, name, email, role: "student" } });
}

async function registerCompany(req, res) {
  const { name, email, password, companyName, industry, website, phone, address, description } = req.body;
  if (!name || !email || !password || !companyName) {
    return res.status(400).json({ message: "Name, email, password and company name are required" });
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    return res.status(409).json({ message: "Email is already registered" });
  }
  const user = await User.create({
    name, email, password: await bcrypt.hash(password, 12), role: "company"
  });
  await Company.create({ user: user._id, companyName, industry, website, phone, address, description });
  res.status(201).json({ token: signToken(user), user: { id: user._id, name, email, role: "company" } });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (!user.active) return res.status(403).json({ message: "Account is inactive" });
  res.json({
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}

async function me(req, res) {
  const result = { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role };
  if (req.user.role === "student") result.profile = await Student.findOne({ user: req.user._id });
  if (req.user.role === "company") result.profile = await Company.findOne({ user: req.user._id });
  res.json({ user: result });
}

module.exports = { registerStudent, registerCompany, login, me };
