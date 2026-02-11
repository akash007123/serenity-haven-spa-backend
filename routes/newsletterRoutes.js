const express = require("express");
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  getSubscriberCount,
  deleteSubscriber,
} = require("../controllers/newsletterController");

// Public routes
router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

// Admin routes (could add authentication middleware in the future)
router.get("/subscribers", getSubscribers);
router.get("/count", getSubscriberCount);
router.delete("/:id", deleteSubscriber);

module.exports = router;
