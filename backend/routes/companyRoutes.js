const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const controller = require("../controllers/companyController");
const asyncHandler = require("../middleware/asyncHandler");

router.get("/", authenticate, asyncHandler(controller.list));
router.get("/me", authenticate, authorize("company"), asyncHandler(controller.getMine));
router.put("/me", authenticate, authorize("company"), asyncHandler(controller.updateMine));
router.post("/", authenticate, authorize("admin"), asyncHandler(controller.create));
router.put("/:id", authenticate, authorize("admin"), asyncHandler(controller.update));
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(controller.remove));

module.exports = router;
