const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const controller = require("../controllers/placementController");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/", authenticate, asyncHandler(controller.list));
router.post("/", authenticate, authorize("admin"), asyncHandler(controller.create));
router.put("/:id", authenticate, authorize("admin"), asyncHandler(controller.update));
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(controller.remove));

module.exports = router;
