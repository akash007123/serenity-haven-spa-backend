const express = require("express");
const router = express.Router();
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  getCategories,
} = require("../controllers/serviceController");

// Service routes
router.get("/", getServices);
router.get("/categories", getCategories);
router.get("/:id", getService);
router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);
router.patch("/:id/toggle-status", toggleServiceStatus);

module.exports = router;
