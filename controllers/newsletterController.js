const Newsletter = require("../models/Newsletter");

/**
 * Subscribe to newsletter
 * POST /api/newsletter/subscribe
 */
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.status === "subscribed") {
        return res.status(400).json({
          success: false,
          message: "This email is already subscribed to our newsletter",
        });
      } else {
        // Re-subscribe previously unsubscribed user
        existingSubscriber.status = "subscribed";
        existingSubscriber.unsubscribedAt = undefined;
        await existingSubscriber.save();

        return res.status(200).json({
          success: true,
          message: "You've been re-subscribed to our newsletter!",
          data: { email: existingSubscriber.email },
        });
      }
    }

    // Create new subscriber
    const subscriber = new Newsletter({ email });
    await subscriber.save();

    res.status(201).json({
      success: true,
      message: "Thank you for subscribing to our newsletter!",
      data: { email: subscriber.email },
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        success: false,
        message: "This email is already subscribed to our newsletter",
      });
    }

    console.error("Newsletter subscribe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to subscribe. Please try again later.",
    });
  }
};

/**
 * Unsubscribe from newsletter
 * POST /api/newsletter/unsubscribe
 */
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const subscriber = await Newsletter.findOneAndUpdate(
      { email },
      { status: "unsubscribed", unsubscribedAt: new Date() },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Email not found in our subscriber list",
      });
    }

    res.status(200).json({
      success: true,
      message: "You've been unsubscribed from our newsletter",
    });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unsubscribe. Please try again later.",
    });
  }
};

/**
 * Get all subscribers (admin only)
 * GET /api/newsletter/subscribers
 */
exports.getSubscribers = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const subscribers = await Newsletter.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Newsletter.countDocuments(query);

    res.status(200).json({
      success: true,
      data: subscribers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get subscribers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers",
    });
  }
};

/**
 * Get subscriber count (admin only)
 * GET /api/newsletter/count
 */
exports.getSubscriberCount = async (req, res) => {
  try {
    const subscribedCount = await Newsletter.countDocuments({
      status: "subscribed",
    });

    const unsubscribedCount = await Newsletter.countDocuments({
      status: "unsubscribed",
    });

    res.status(200).json({
      success: true,
      data: {
        subscribed: subscribedCount,
        unsubscribed: unsubscribedCount,
        total: subscribedCount + unsubscribedCount,
      },
    });
  } catch (error) {
    console.error("Get subscriber count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriber count",
    });
  }
};

/**
 * Delete subscriber (admin only)
 * DELETE /api/newsletter/:id
 */
exports.deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscriber deleted successfully",
    });
  } catch (error) {
    console.error("Delete subscriber error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete subscriber",
    });
  }
};
