const Therapist = require("../models/Therapist");
const path = require("path");
const fs = require("fs");

// Get all therapists
exports.getTherapists = async (req, res) => {
  try {
    const { active, featured, search, page = 1, limit = 50 } = req.query;
    
    const query = {};
    
    if (active !== undefined) {
      query.isActive = active === "true";
    }
    if (featured === "true") {
      query.isFeatured = true;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialties: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Therapist.countDocuments(query);
    
    const therapists = await Therapist.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: therapists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single therapist by ID
exports.getTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    
    let therapist;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      therapist = await Therapist.findById(id);
    } else {
      therapist = await Therapist.findOne({ slug: id });
    }

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    res.json({
      success: true,
      data: therapist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new therapist
exports.createTherapist = async (req, res) => {
  try {
    const {
      name,
      title,
      specialties,
      experience,
      bio,
      email,
      phone,
      languages,
      availability,
      rating,
      reviewCount,
      bookingCount,
      isActive = true,
      isFeatured = false,
    } = req.body;

    // Handle file upload
    let profilePic = "";
    if (req.file) {
      profilePic = `uploads/profile-pics/${req.file.filename}`;
    }

    const therapist = new Therapist({
      name,
      title,
      specialties: specialties ? (typeof specialties === "string" ? JSON.parse(specialties) : specialties) : [],
      experience,
      bio,
      profilePic,
      email,
      phone,
      languages: languages ? (typeof languages === "string" ? JSON.parse(languages) : languages) : [],
      availability: availability ? (typeof availability === "string" ? JSON.parse(availability) : availability) : [],
      rating,
      reviewCount,
      bookingCount,
      isActive,
      isFeatured,
    });

    await therapist.save();

    res.status(201).json({
      success: true,
      message: "Therapist created successfully",
      data: therapist,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update therapist
exports.updateTherapist = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await Therapist.findById(id);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    // Handle file upload
    let profilePic = therapist.profilePic;
    if (req.file) {
      // Delete old profile pic if exists
      if (therapist.profilePic) {
        const oldPath = path.join(__dirname, "..", therapist.profilePic);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      profilePic = `uploads/profile-pics/${req.file.filename}`;
    }

    const {
      name,
      title,
      specialties,
      experience,
      bio,
      email,
      phone,
      languages,
      availability,
      rating,
      reviewCount,
      bookingCount,
      isActive,
      isFeatured,
    } = req.body;

    // Update fields
    if (name) therapist.name = name;
    if (title) therapist.title = title;
    if (specialties) {
      therapist.specialties = typeof specialties === "string" ? JSON.parse(specialties) : specialties;
    }
    if (experience) therapist.experience = experience;
    if (bio) therapist.bio = bio;
    if (profilePic) therapist.profilePic = profilePic;
    if (email !== undefined) therapist.email = email;
    if (phone !== undefined) therapist.phone = phone;
    if (languages) {
      therapist.languages = typeof languages === "string" ? JSON.parse(languages) : languages;
    }
    if (availability) {
      therapist.availability = typeof availability === "string" ? JSON.parse(availability) : availability;
    }
    if (rating !== undefined) therapist.rating = rating;
    if (reviewCount !== undefined) therapist.reviewCount = reviewCount;
    if (bookingCount !== undefined) therapist.bookingCount = bookingCount;
    if (isActive !== undefined) therapist.isActive = isActive;
    if (isFeatured !== undefined) therapist.isFeatured = isFeatured;

    await therapist.save();

    res.json({
      success: true,
      message: "Therapist updated successfully",
      data: therapist,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete therapist
exports.deleteTherapist = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await Therapist.findById(id);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    // Delete profile pic if exists
    if (therapist.profilePic) {
      const profilePicPath = path.join(__dirname, "..", therapist.profilePic);
      if (fs.existsSync(profilePicPath)) {
        fs.unlinkSync(profilePicPath);
      }
    }

    await Therapist.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Therapist deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle therapist active status
exports.toggleTherapistStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await Therapist.findById(id);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    therapist.isActive = !therapist.isActive;
    await therapist.save();

    res.json({
      success: true,
      message: `Therapist ${therapist.isActive ? "activated" : "deactivated"} successfully`,
      data: therapist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await Therapist.findById(id);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    therapist.isFeatured = !therapist.isFeatured;
    await therapist.save();

    res.json({
      success: true,
      message: `Therapist ${therapist.isFeatured ? "featured" : "unfeatured"} successfully`,
      data: therapist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
