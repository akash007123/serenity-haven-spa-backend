const Contact = require("../models/Contact");
const emailService = require("../utils/emailService");

/**
 * Contact Controller
 * Handles all CRUD operations for contact form submissions
 */

/**
 * Create a new contact message
 * POST /api/contacts
 */
exports.createContact = async (req, res) => {
  try {
    const { name, email, mobile, subject, message } = req.body;

    const contact = new Contact({
      name,
      email,
      mobile,
      subject,
      message,
    });

    await contact.save();

    try {
      await emailService.sendContactConfirmation({ name, email, subject });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError.message);
    }

    try {
      await emailService.sendAdminNotification("contact", { name, email, subject, message });
    } catch (adminError) {
      console.error("Failed to send admin notification:", adminError.message);
    }

    res.status(201).json({
      success: true,
      message: "Contact message sent successfully! We'll get back to you soon.",
      data: contact,
    });
  } catch (error) {
    console.error("Contact creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send contact message. Please try again.",
      error: error.message,
    });
  }
};

/**
 * Get all contact messages
 * GET /api/contacts
 */
exports.getContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
      error: error.message,
    });
  }
};

/**
 * Get a single contact message by ID
 * GET /api/contacts/:id
 */
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    if (contact.status === "new") {
      contact.status = "read";
      await contact.save();
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Get contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact message",
      error: error.message,
    });
  }
};

/**
 * Update a contact message
 * PUT /api/contacts/:id
 */
exports.updateContact = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    if (status) contact.status = status;
    if (notes !== undefined) contact.notes = notes;

    if (status === "replied" && !contact.repliedAt) {
      contact.repliedAt = new Date();
    }

    await contact.save();

    res.json({
      success: true,
      message: "Contact updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact",
      error: error.message,
    });
  }
};

/**
 * Delete a contact message
 * DELETE /api/contacts/:id
 */
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    res.json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact",
      error: error.message,
    });
  }
};

/**
 * Get contact statistics
 * GET /api/contacts/stats
 */
exports.getContactStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Contact.countDocuments();
    const newMessages = await Contact.countDocuments({ status: "new" });

    const statusCounts = {};
    stats.forEach((stat) => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        total,
        newMessages,
        byStatus: statusCounts,
      },
    });
  } catch (error) {
    console.error("Get contact stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact statistics",
      error: error.message,
    });
  }
};
