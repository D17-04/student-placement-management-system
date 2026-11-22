const Company = require("../models/Company");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.list = async (req, res) => {
  const { search } = req.query;
  const filter = search ? { companyName: new RegExp(search, "i") } : {};
  res.json(await Company.find(filter).populate("user", "name email active"));
};

exports.getMine = async (req, res) => {
  const company = await Company.findOne({ user: req.user._id }).populate("user", "name email");
  if (!company) return res.status(404).json({ message: "Company profile not found" });
  res.json(company);
};

exports.updateMine = async (req, res) => {
  const allowed = ["companyName", "industry", "website", "phone", "address", "description"];
  const updates = {};
  allowed.forEach(key => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });
  const company = await Company.findOneAndUpdate(
    { user: req.user._id }, updates, { new: true, runValidators: true }
  );
  res.json(company);
};

exports.create = async (req, res) => {
  if (!req.body.companyName) return res.status(400).json({ message: "Company name is required" });
  let companyUser;
  if (req.body.email && req.body.password) {
    if (await User.findOne({ email: req.body.email.toLowerCase() })) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    companyUser = await User.create({
      name: req.body.contactName || req.body.companyName,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 12),
      role: "company"
    });
  } else {
    companyUser = req.user;
  }
  const company = await Company.create({
    companyName: req.body.companyName,
    industry: req.body.industry,
    website: req.body.website,
    phone: req.body.phone,
    address: req.body.address,
    description: req.body.description,
    user: companyUser._id
  });
  res.status(201).json(company);
};

exports.update = async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!company) return res.status(404).json({ message: "Company not found" });
  res.json(company);
};

exports.remove = async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ message: "Company not found" });
  await User.findByIdAndDelete(company.user);
  await company.deleteOne();
  res.json({ message: "Company deleted" });
};
