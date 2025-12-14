const Specialization = require("../models/Specialization.js");
const AppointmentQuestion = require("../models/AppointmentQuestion.js");
const mongoose = require("mongoose");

/**
 * @desc    Create a new specialization
 * @route   POST /api/admin/specializations
 * @access  Admin
 */
const createSpecialization = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const { name, description, imageUrl, consultationFee, isActive, tags } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Specialization name is required",
        code: "NAME_REQUIRED",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
        code: "DESCRIPTION_REQUIRED",
      });
    }

    if (!consultationFee || consultationFee <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid consultation fee is required",
        code: "INVALID_CONSULTATION_FEE",
      });
    }

    // Check for duplicate
    const existingSpecialization = await Specialization.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingSpecialization) {
      return res.status(409).json({
        success: false,
        message: "Specialization with this name already exists",
        code: "SPECIALIZATION_EXISTS",
      });
    }

    const specialization = new Specialization({
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl || null,
      consultationFee,
      isActive: isActive !== undefined ? isActive : true,
      tags: tags || [],
    });

    await specialization.save();

    return res.status(201).json({
      success: true,
      message: "Specialization created successfully",
      code: "SPECIALIZATION_CREATED",
      data: {
        specialization,
      },
    });
  } catch (error) {
    console.error("Error creating specialization:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create specialization",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all specializations
 * @route   GET /api/admin/specializations
 * @access  Admin
 */
const getAllSpecializations = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {};

    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === "true";
    }

    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { tags: { $in: [new RegExp(req.query.search, "i")] } },
      ];
    }

    const specializations = await Specialization.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Specialization.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Specializations retrieved successfully",
      code: "SPECIALIZATIONS_RETRIEVED",
      data: {
        specializations,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching specializations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve specializations",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get specialization by ID
 * @route   GET /api/admin/specializations/:id
 * @access  Admin
 */
const getSpecializationById = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid specialization ID format",
        code: "INVALID_SPECIALIZATION_ID",
      });
    }

    const specialization = await Specialization.findById(id).lean();

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found",
        code: "SPECIALIZATION_NOT_FOUND",
      });
    }

    // Get associated questions
    const questions = await AppointmentQuestion.find({
      $or: [{ specializationId: id }, { specializationId: null }],
      isActive: true,
    })
      .sort({ order: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Specialization retrieved successfully",
      code: "SPECIALIZATION_RETRIEVED",
      data: {
        specialization,
        questions,
      },
    });
  } catch (error) {
    console.error("Error fetching specialization:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve specialization",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Update specialization
 * @route   PUT /api/admin/specializations/:id
 * @access  Admin
 */
const updateSpecialization = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;
    const { name, description, imageUrl, consultationFee, isActive, tags } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid specialization ID format",
        code: "INVALID_SPECIALIZATION_ID",
      });
    }

    const specialization = await Specialization.findById(id);

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found",
        code: "SPECIALIZATION_NOT_FOUND",
      });
    }

    // Check for duplicate name if name is being changed
    if (name && name.trim().toLowerCase() !== specialization.name.toLowerCase()) {
      const existingSpecialization = await Specialization.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      });

      if (existingSpecialization) {
        return res.status(409).json({
          success: false,
          message: "Specialization with this name already exists",
          code: "SPECIALIZATION_EXISTS",
        });
      }
    }

    // Update fields
    if (name !== undefined) specialization.name = name.trim();
    if (description !== undefined) specialization.description = description.trim();
    if (imageUrl !== undefined) specialization.imageUrl = imageUrl;
    if (consultationFee !== undefined) specialization.consultationFee = consultationFee;
    if (isActive !== undefined) specialization.isActive = isActive;
    if (tags !== undefined) specialization.tags = tags;

    await specialization.save();

    return res.status(200).json({
      success: true,
      message: "Specialization updated successfully",
      code: "SPECIALIZATION_UPDATED",
      data: {
        specialization,
      },
    });
  } catch (error) {
    console.error("Error updating specialization:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update specialization",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete specialization
 * @route   DELETE /api/admin/specializations/:id
 * @access  Admin
 */
const deleteSpecialization = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid specialization ID format",
        code: "INVALID_SPECIALIZATION_ID",
      });
    }

    const specialization = await Specialization.findByIdAndDelete(id);

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found",
        code: "SPECIALIZATION_NOT_FOUND",
      });
    }

    // Delete associated questions that are specific to this specialization
    await AppointmentQuestion.deleteMany({ specializationId: id });

    return res.status(200).json({
      success: true,
      message: "Specialization deleted successfully",
      code: "SPECIALIZATION_DELETED",
      data: {
        deletedSpecialization: {
          id: specialization._id,
          name: specialization.name,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting specialization:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete specialization",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

module.exports = {
  createSpecialization,
  getAllSpecializations,
  getSpecializationById,
  updateSpecialization,
  deleteSpecialization,
};
