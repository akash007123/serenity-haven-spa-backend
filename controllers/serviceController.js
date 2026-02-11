const Service = require("../models/Service");

// Get all services
exports.getServices = async (req, res) => {
  try {
    const { category, featured, popular, active, search, page = 1, limit = 50 } = req.query;
    
    const query = {};
    
    if (category) {
      query.category = category;
    }
    if (featured === "true") {
      query.featured = true;
    }
    if (popular === "true") {
      query.popular = true;
    }
    if (active !== "false") {
      query.isActive = true;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Service.countDocuments(query);
    
    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: services,
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

// Get single service by ID or slug
exports.getService = async (req, res) => {
  try {
    const { id } = req.params;
    
    let service;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      service = await Service.findById(id);
    } else {
      service = await Service.findOne({ slug: id });
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new service
exports.createService = async (req, res) => {
  try {
    const {
      name,
      shortDescription,
      description,
      durations,
      price,
      priceRange,
      image,
      category,
      featured,
      popular,
      benefits,
      benefitDetails,
      whatToExpect,
      contraindications,
      preparationTips,
      rating,
      reviewCount,
      color,
      gradient,
      isActive = true,
    } = req.body;

    const service = new Service({
      name,
      shortDescription,
      description,
      durations,
      price,
      priceRange,
      image,
      category,
      featured,
      popular,
      benefits,
      benefitDetails,
      whatToExpect,
      contraindications,
      preparationTips,
      rating,
      reviewCount,
      color,
      gradient,
      isActive,
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle service active status
exports.toggleServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.json({
      success: true,
      message: `Service ${service.isActive ? "activated" : "deactivated"} successfully`,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get service categories
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { id: "classic", name: "Classic", icon: "heart" },
      { id: "therapeutic", name: "Therapeutic", icon: "shield" },
      { id: "wellness", name: "Wellness", icon: "leaf" },
      { id: "traditional", name: "Traditional", icon: "star" },
      { id: "targeted", name: "Targeted", icon: "crosshair" },
      { id: "specialty", name: "Specialty", icon: "award" },
    ];

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
