const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { registerStudent, registerCompany, login, me } = require("../controllers/authController");
const asyncHandler = require("../middleware/asyncHandler");

router.post("/register/student", asyncHandler(registerStudent));
router.post("/register/company", asyncHandler(registerCompany));
router.post("/login", asyncHandler(login));
router.get("/me", authenticate, asyncHandler(me));

module.exports = router;
