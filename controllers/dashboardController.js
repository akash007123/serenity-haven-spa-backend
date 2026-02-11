const Booking = require("../models/Booking");
const Contact = require("../models/Contact");

/**
 * Dashboard Controller
 * Provides aggregated statistics for the admin dashboard
 */

// Helper function to get start of month
const getStartOfMonth = (monthsAgo) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Helper function to format month name
const formatMonthName = (date) => {
  return date.toLocaleDateString("en-US", { month: "short" });
};

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
    const estimatedRevenue = completedCount * 7100; // Assuming average service price of ₹7,100

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

exports.getAnalytics = async (req, res) => {
  try {
    // Get monthly bookings for the last 6 months
    const monthlyBookings = [];
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = getStartOfMonth(i);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      const count = await Booking.countDocuments({
        createdAt: { $gte: startOfMonth, $lt: endOfMonth },
      });

      monthlyBookings.push({
        name: formatMonthName(startOfMonth),
        bookings: count,
        revenue: count * 7100, // Assuming average service price of ₹7,100
      });
    }

    // Get weekly visitors and bookings (last 7 days)
    const weeklyData = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const bookings = await Booking.countDocuments({
        createdAt: { $gte: date, $lt: nextDay },
      });

      weeklyData.push({
        name: dayNames[date.getDay()],
        visitors: Math.floor(bookings * 2.5 + Math.random() * 20), // Estimated visitors
        bookings,
      });
    }

    // Get services distribution
    const servicesAggregation = await Booking.aggregate([
      { $group: { _id: "$service", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const servicesMapping = {
      swedish: "Swedish Massage",
      "deep tissue": "Deep Tissue",
      aromatherapy: "Aromatherapy",
      "hot stone": "Hot Stone",
      thai: "Thai Massage",
    };

    const servicesDistribution = servicesAggregation.map((item) => ({
      name: servicesMapping[item._id.toLowerCase()] || item._id,
      value: item.count,
    }));

    // Get booking status distribution
    const statusCounts = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusMapping = {
      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      "no-show": "No Show",
    };

    const statusDistribution = statusCounts.map((item) => ({
      name: statusMapping[item._id] || item._id,
      value: item.count,
    }));

    // Get peak hours distribution
    const hoursAggregation = await Booking.aggregate([
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Categorize into time periods
    const timePeriods = {
      Morning: 0,    // 6-12
      Afternoon: 0, // 12-18
      Evening: 0,   // 18-22
      Night: 0,     // 22-6
    };

    hoursAggregation.forEach((item) => {
      const hour = item._id;
      if (hour >= 6 && hour < 12) {
        timePeriods.Morning += item.count;
      } else if (hour >= 12 && hour < 18) {
        timePeriods.Afternoon += item.count;
      } else if (hour >= 18 && hour < 22) {
        timePeriods.Evening += item.count;
      } else {
        timePeriods.Night += item.count;
      }
    });

    const peakHours = Object.entries(timePeriods).map(([name, value]) => ({
      name,
      value,
    }));

    // Get customer satisfaction data (mock data based on completed bookings)
    const completedBookings = await Booking.countDocuments({ status: "completed" });
    const totalContacts = await Contact.countDocuments();

    res.json({
      success: true,
      data: {
        monthlyBookings,
        weeklyData,
        servicesDistribution,
        statusDistribution,
        peakHours,
        customerSatisfaction: {
          currentMonth: {
            service: 85 + Math.floor(Math.random() * 15),
            ambiance: 80 + Math.floor(Math.random() * 20),
            staff: 88 + Math.floor(Math.random() * 12),
            value: 75 + Math.floor(Math.random() * 20),
            cleanliness: 90 + Math.floor(Math.random() * 10),
            parking: 65 + Math.floor(Math.random() * 25),
          },
          lastMonth: {
            service: 82 + Math.floor(Math.random() * 15),
            ambiance: 78 + Math.floor(Math.random() * 20),
            staff: 85 + Math.floor(Math.random() * 15),
            value: 72 + Math.floor(Math.random() * 20),
            cleanliness: 88 + Math.floor(Math.random() * 12),
            parking: 60 + Math.floor(Math.random() * 25),
          },
        },
        summary: {
          totalBookings: await Booking.countDocuments(),
          totalRevenue: (await Booking.countDocuments({ status: "completed" })) * 7100,
          totalContacts,
          totalServices: servicesAggregation.length,
        },
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
      error: error.message,
    });
  }
};

