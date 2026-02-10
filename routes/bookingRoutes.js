const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBookings);
router.get("/availability/:date", bookingController.getAvailableSlots);
router.get("/stats", bookingController.getBookingStats);
router.get("/:id", bookingController.getBookingById);
router.put("/:id", bookingController.updateBooking);
router.delete("/:id", bookingController.deleteBooking);
router.post("/:id/resend-email", bookingController.resendConfirmationEmail);

module.exports = router;
