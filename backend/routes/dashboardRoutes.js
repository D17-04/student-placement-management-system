const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const { stats } = require("../controllers/dashboardController");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/", authenticate, authorize("admin"), asyncHandler(stats));

module.exports = router;
