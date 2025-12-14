const Specialization = require("../models/Specialization.js");
const AppointmentQuestion = require("../models/AppointmentQuestion.js");
const mongoose = require("mongoose");

/**
 * @desc    Get all active specializations (public)
 * @route   GET /api/specializations
 * @access  Public
 */
const getActiveSpecializations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filters = { isActive: true };

    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { tags: { $in: [new RegExp(req.query.search, "i")] } },
      ];
    }

    const specializations = await Specialization.find(filters)
      .select("name description imageUrl consultationFee tags")
      .sort({ name: 1 })
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
 * @desc    Get specialization by ID with questions (public)
 * @route   GET /api/specializations/:id
 * @access  Public
 */
const getSpecializationWithQuestions = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid specialization ID format",
        code: "INVALID_SPECIALIZATION_ID",
      });
    }

    const specialization = await Specialization.findOne({
      _id: id,
      isActive: true,
    })
      .select("name description imageUrl consultationFee tags")
      .lean();

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found",
        code: "SPECIALIZATION_NOT_FOUND",
      });
    }

    // Get questions for this specialization (both specific and global)
    const questions = await AppointmentQuestion.find({
      $or: [{ specializationId: id }, { specializationId: null }],
      isActive: true,
    })
      .select("question questionType options isRequired placeholder order")
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

module.exports = {
  getActiveSpecializations,
  getSpecializationWithQuestions,
};
