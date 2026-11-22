const Student = require("../models/Student");
const User = require("../models/User");

exports.list = async (req, res) => {
  const { search, status, course } = req.query;
  const filter = {};
  if (status) filter.placementStatus = status;
  if (course) filter.course = new RegExp(course, "i");
  if (search) {
    filter.$or = [
      { rollNumber: new RegExp(search, "i") },
      { skills: new RegExp(search, "i") }
    ];
  }
  const students = await Student.find(filter).populate("user", "name email active");
  res.json(students);
};

exports.getMine = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate("user", "name email");
  if (!student) return res.status(404).json({ message: "Student profile not found" });
  res.json(student);
};

exports.updateMine = async (req, res) => {
  const allowed = ["rollNumber", "course", "semester", "phone", "dateOfBirth", "address", "cgpa", "skills"];
  const updates = {};
  allowed.forEach(key => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });
  if (typeof updates.skills === "string") {
    updates.skills = updates.skills.split(",").map(s => s.trim()).filter(Boolean);
  }
  const student = await Student.findOneAndUpdate(
    { user: req.user._id }, updates, { new: true, runValidators: true }
  );
  if (!student) return res.status(404).json({ message: "Student profile not found" });
  res.json(student);
};

exports.uploadResume = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Upload a PDF, DOC or DOCX resume" });
  const student = await Student.findOneAndUpdate(
    { user: req.user._id },
    { resume: `/uploads/${req.file.filename}` },
    { new: true }
  );
  res.json({ message: "Resume uploaded", resume: student.resume });
};

exports.remove = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });
  await User.findByIdAndDelete(student.user);
  await student.deleteOne();
  res.json({ message: "Student deleted" });
};
