const Razorpay = require("razorpay");
const crypto = require("crypto");
const config = require("../config/config.js");

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

/**
 * Create Razorpay order for appointment payment
 */
const createOrder = async (amount, appointmentId, patientEmail) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
      currency: "INR",
      receipt: `appointment_${appointmentId}`,
      notes: {
        appointmentId: appointmentId.toString(),
        patientEmail,
      },
    };

    const order = await razorpayInstance.orders.create(options);
    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify Razorpay payment signature
 */
const verifyPaymentSignature = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
) => {
  try {
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generated_signature = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(text)
      .digest("hex");

    return generated_signature === razorpaySignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

/**
 * Verify webhook signature
 */
const verifyWebhookSignature = (payload, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.webhookSecret)
      .update(JSON.stringify(payload))
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("Webhook signature verification error:", error);
    return false;
  }
};

/**
 * Fetch payment details from Razorpay
 */
const fetchPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return {
      success: true,
      payment,
    };
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Initiate refund for a payment
 */
const initiateRefund = async (paymentId, amount, notes = {}) => {
  try {
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // Convert to paise
      notes,
    });

    return {
      success: true,
      refund,
    };
  } catch (error) {
    console.error("Refund initiation error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  razorpayInstance,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  fetchPaymentDetails,
  initiateRefund,
};
