const Booking = require("../models/Booking");
const emailService = require("../utils/emailService");

/**
 * Booking Controller
 * Handles all CRUD operations for spa bookings
 */

exports.createBooking = async (req, res) => {
  try {
    const { name, phone, email, service, therapist, date, time, message } = req.body;

    const existingBooking = await Booking.findOne({
      service,
      date,
      time,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked. Please choose another time.",
      });
    }

    const booking = new Booking({
      name,
      phone,
      email,
      service,
      therapist,
      date,
      time,
      message,
    });

    await booking.save();

    try {
      await emailService.sendBookingConfirmation({
        name,
        email,
        service,
        date,
        time,
        therapist,
      });
      booking.confirmationSentAt = new Date();
      await booking.save();
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError.message);
    }

    try {
      await emailService.sendAdminNotification("booking", {
        name,
        email,
        phone,
        service,
        date,
        time,
        therapist,
        message,
      });
    } catch (adminError) {
      console.error("Failed to send admin notification:", adminError.message);
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully! A confirmation email has been sent.",
      data: booking,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking. Please try again.",
      error: error.message,
    });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (date) query.date = date;

    const bookings = await Booking.find(query)
      .sort({ date: 1, time: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { status, notes, therapist, time, date, cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (status) booking.status = status;
    if (notes !== undefined) booking.notes = notes;
    if (therapist !== undefined) booking.therapist = therapist;
    if (time) booking.time = time;
    if (date) booking.date = date;

    if (status === "cancelled") {
      booking.cancellationReason = cancellationReason || "No reason provided";
      try {
        await emailService.sendBookingCancellation({
          name: booking.name,
          email: booking.email,
          service: booking.service,
          date: booking.date,
          time: booking.time,
          cancellationReason: booking.cancellationReason,
        });
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError.message);
      }
    }

    await booking.save();

    res.json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking",
      error: error.message,
    });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
      error: error.message,
    });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.params;
    const allSlots = [
      "09:00", "10:00", "11:00", "12:00",
      "13:00", "14:00", "15:00", "16:00", "17:00",
    ];

    const bookedBookings = await Booking.find({
      date,
      status: { $in: ["pending", "confirmed"] },
    }).select("time");

    const bookedSlots = bookedBookings.map((b) => b.time);
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    res.json({
      success: true,
      data: {
        date,
        allSlots,
        bookedSlots,
        availableSlots,
      },
    });
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch availability",
      error: error.message,
    });
  }
};

exports.getBookingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateQuery = {};

    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) dateQuery.date.$gte = startDate;
      if (endDate) dateQuery.date.$lte = endDate;
    }

    const stats = await Booking.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const total = await Booking.countDocuments(dateQuery);
    const pending = await Booking.countDocuments({ ...dateQuery, status: "pending" });
    const confirmed = await Booking.countDocuments({ ...dateQuery, status: "confirmed" });
    const completed = await Booking.countDocuments({ ...dateQuery, status: "completed" });
    const cancelled = await Booking.countDocuments({ ...dateQuery, status: "cancelled" });

    const statusCounts = {};
    stats.forEach((stat) => {
      statusCounts[stat._id] = stat.count;
    });

    const popularServices = await Booking.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$service", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: { pending, confirmed, completed, cancelled, ...statusCounts },
        popularServices,
      },
    });
  } catch (error) {
    console.error("Get booking stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking statistics",
      error: error.message,
    });
  }
};

exports.resendConfirmationEmail = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await emailService.sendBookingConfirmation({
      name: booking.name,
      email: booking.email,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      therapist: booking.therapist,
    });

    booking.confirmationSentAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: "Confirmation email resent successfully",
    });
  } catch (error) {
    console.error("Resend email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend confirmation email",
      error: error.message,
    });
  }
};
