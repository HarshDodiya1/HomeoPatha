/**
 * Razorpay Utility Functions
 * Helper functions for Razorpay integration
 */

/**
 * Load Razorpay checkout script dynamically
 * @returns Promise<boolean> - True if script loaded successfully
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };

    if (typeof document !== "undefined") {
      document.body.appendChild(script);
    } else {
      resolve(false);
    }
  });
};

/**
 * Format currency for display
 * @param amount - Amount in INR
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Validate Razorpay payment response
 * @param response - Razorpay success response
 * @returns boolean - True if response is valid
 */
export const isValidRazorpayResponse = (response: any): boolean => {
  return !!(
    response &&
    response.razorpay_order_id &&
    response.razorpay_payment_id &&
    response.razorpay_signature
  );
};
