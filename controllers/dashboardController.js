const Booking = require("../models/Booking");
const Contact = require("../models/Contact");

/**
 * Dashboard Controller
 * Provides aggregated statistics for the admin dashboard
 */

exports.getDashboardStats = async (req, res) => {
  try {
    // Get booking stats
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });
    const completedBookings = await Booking.countDocuments({ status: "completed" });
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });

    // Get recent bookings (last 10)
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name service date time status createdAt");

    // Get contact stats
    const totalContacts = await Contact.countDocuments();
    const unreadContacts = await Contact.countDocuments({ status: { $in: ["new", "read"] } });
    
    // Get recent contacts (last 10)
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name email subject date status createdAt");

    // Calculate revenue (sum of completed bookings - estimate)
    // In a real app, you might have a price field in the booking
    const revenueData = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);
    const completedCount = revenueData.length > 0 ? revenueData[0].total : 0;
    const estimatedRevenue = completedCount * 85; // Assuming average service price of $85

    // Get unique clients (by email)
    const uniqueClients = await Booking.distinct("email");

    res.json({
      success: true,
      data: {
        stats: {
          totalBookings,
          pendingBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
          totalContacts,
          unreadContacts,
          uniqueClients: uniqueClients.length,
          estimatedRevenue,
        },
        recentBookings,
        recentContacts,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};
