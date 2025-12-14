const AppointmentQuestion = require("../models/AppointmentQuestion.js");
const Specialization = require("../models/Specialization.js");
const mongoose = require("mongoose");

/**
 * @desc    Create a new appointment question
 * @route   POST /api/admin/appointment-questions
 * @access  Admin
 */
const createQuestion = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const {
      question,
      questionType,
      options,
      isRequired,
      specializationId,
      order,
      placeholder,
    } = req.body;

    // Validation
    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question text is required",
        code: "QUESTION_REQUIRED",
      });
    }

    if (!questionType) {
      return res.status(400).json({
        success: false,
        message: "Question type is required",
        code: "QUESTION_TYPE_REQUIRED",
      });
    }

    const validTypes = ["text", "textarea", "select", "checkbox", "radio", "date", "number"];
    if (!validTypes.includes(questionType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid question type. Must be one of: ${validTypes.join(", ")}`,
        code: "INVALID_QUESTION_TYPE",
      });
    }

    // Options are required for select, checkbox, and radio types
    if (["select", "checkbox", "radio"].includes(questionType)) {
      if (!options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Options are required for select, checkbox, and radio question types (minimum 2)",
          code: "OPTIONS_REQUIRED",
        });
      }
    }

    // Validate specializationId if provided
    if (specializationId && specializationId !== null) {
      if (!mongoose.Types.ObjectId.isValid(specializationId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid specialization ID format",
          code: "INVALID_SPECIALIZATION_ID",
        });
      }

      const specializationExists = await Specialization.findById(specializationId);
      if (!specializationExists) {
        return res.status(404).json({
          success: false,
          message: "Specialization not found",
          code: "SPECIALIZATION_NOT_FOUND",
        });
      }
    }

    const appointmentQuestion = new AppointmentQuestion({
      question: question.trim(),
      questionType,
      options: options || [],
      isRequired: isRequired !== undefined ? isRequired : true,
      specializationId: specializationId || null,
      order: order || 0,
      placeholder: placeholder || "",
      isActive: true,
    });

    await appointmentQuestion.save();

    const populatedQuestion = await AppointmentQuestion.findById(appointmentQuestion._id)
      .populate("specializationId", "name")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      code: "QUESTION_CREATED",
      data: {
        question: populatedQuestion,
      },
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create question",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all appointment questions
 * @route   GET /api/admin/appointment-questions
 * @access  Admin
 */
const getAllQuestions = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filters = {};

    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === "true";
    }

    if (req.query.specializationId) {
      if (req.query.specializationId === "global") {
        filters.specializationId = null;
      } else if (mongoose.Types.ObjectId.isValid(req.query.specializationId)) {
        filters.specializationId = req.query.specializationId;
      }
    }

    if (req.query.questionType) {
      filters.questionType = req.query.questionType;
    }

    if (req.query.search) {
      filters.question = { $regex: req.query.search, $options: "i" };
    }

    const questions = await AppointmentQuestion.find(filters)
      .populate("specializationId", "name")
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AppointmentQuestion.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Questions retrieved successfully",
      code: "QUESTIONS_RETRIEVED",
      data: {
        questions,
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
    console.error("Error fetching questions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve questions",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Get question by ID
 * @route   GET /api/admin/appointment-questions/:id
 * @access  Admin
 */
const getQuestionById = async (req, res) => {
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
        message: "Invalid question ID format",
        code: "INVALID_QUESTION_ID",
      });
    }

    const question = await AppointmentQuestion.findById(id)
      .populate("specializationId", "name")
      .lean();

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
        code: "QUESTION_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question retrieved successfully",
      code: "QUESTION_RETRIEVED",
      data: {
        question,
      },
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve question",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Update question
 * @route   PUT /api/admin/appointment-questions/:id
 * @access  Admin
 */
const updateQuestion = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const { id } = req.params;
    const {
      question,
      questionType,
      options,
      isRequired,
      specializationId,
      order,
      isActive,
      placeholder,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID format",
        code: "INVALID_QUESTION_ID",
      });
    }

    const existingQuestion = await AppointmentQuestion.findById(id);

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
        code: "QUESTION_NOT_FOUND",
      });
    }

    // Validate specializationId if provided
    if (specializationId !== undefined && specializationId !== null) {
      if (!mongoose.Types.ObjectId.isValid(specializationId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid specialization ID format",
          code: "INVALID_SPECIALIZATION_ID",
        });
      }

      const specializationExists = await Specialization.findById(specializationId);
      if (!specializationExists) {
        return res.status(404).json({
          success: false,
          message: "Specialization not found",
          code: "SPECIALIZATION_NOT_FOUND",
        });
      }
    }

    // Validate options if question type requires them
    const typeToCheck = questionType || existingQuestion.questionType;
    if (["select", "checkbox", "radio"].includes(typeToCheck)) {
      const optionsToCheck = options !== undefined ? options : existingQuestion.options;
      if (!optionsToCheck || !Array.isArray(optionsToCheck) || optionsToCheck.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Options are required for select, checkbox, and radio question types (minimum 2)",
          code: "OPTIONS_REQUIRED",
        });
      }
    }

    // Update fields
    if (question !== undefined) existingQuestion.question = question.trim();
    if (questionType !== undefined) existingQuestion.questionType = questionType;
    if (options !== undefined) existingQuestion.options = options;
    if (isRequired !== undefined) existingQuestion.isRequired = isRequired;
    if (specializationId !== undefined) existingQuestion.specializationId = specializationId;
    if (order !== undefined) existingQuestion.order = order;
    if (isActive !== undefined) existingQuestion.isActive = isActive;
    if (placeholder !== undefined) existingQuestion.placeholder = placeholder;

    await existingQuestion.save();

    const populatedQuestion = await AppointmentQuestion.findById(id)
      .populate("specializationId", "name")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      code: "QUESTION_UPDATED",
      data: {
        question: populatedQuestion,
      },
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update question",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete question
 * @route   DELETE /api/admin/appointment-questions/:id
 * @access  Admin
 */
const deleteQuestion = async (req, res) => {
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
        message: "Invalid question ID format",
        code: "INVALID_QUESTION_ID",
      });
    }

    const question = await AppointmentQuestion.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
        code: "QUESTION_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
      code: "QUESTION_DELETED",
      data: {
        deletedQuestion: {
          id: question._id,
          question: question.question,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete question",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc    Reorder questions
 * @route   PUT /api/admin/appointment-questions/reorder
 * @access  Admin
 */
const reorderQuestions = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "FORBIDDEN",
      });
    }

    const { orders } = req.body; // Array of { id, order }

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        message: "Orders array is required",
        code: "ORDERS_REQUIRED",
      });
    }

    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await AppointmentQuestion.bulkWrite(bulkOps);

    return res.status(200).json({
      success: true,
      message: "Questions reordered successfully",
      code: "QUESTIONS_REORDERED",
    });
  } catch (error) {
    console.error("Error reordering questions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reorder questions",
      code: "SERVER_ERROR",
      error: error.message,
    });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
};
