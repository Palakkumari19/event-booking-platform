import apiClient from "./client";

// ============================================================
// CREATE PAYMENT LINK
// ============================================================

export const createPaymentLink = async (bookingId) => {
  const response = await apiClient.post(
    "/payments/create-order/",
    {
      booking_id: bookingId,
    }
  );

  return response.data;
};

// ============================================================
// VERIFY PAYMENT
// ============================================================

export const verifyPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const response = await apiClient.post(
    "/payments/verify/",
    {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }
  );

  return response.data;
};

// ============================================================
// CHECK PAYMENT STATUS
// ============================================================

export const checkPaymentStatus = async (bookingId) => {
  const response = await apiClient.post(
    "/payments/status/",
    {
      booking_id: bookingId,
    }
  );

  return response.data;
};