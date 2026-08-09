import apiClient from "./client";

// ============================================================
// GET EVENT SEATS
// ============================================================

export const getEventSeats = async (eventId) => {
  const response = await apiClient.get(
    "/bookings/seats/",
    {
      params: {
        event: eventId,
      },
    }
  );

  return response.data;
};

// ============================================================
// HOLD SEAT
// ============================================================

export const holdSeat = async (
  eventId,
  seatId
) => {
  const response = await apiClient.post(
    "/bookings/hold/",
    {
      event: eventId,
      seat: seatId,
    }
  );

  return response.data;
};

// ============================================================
// CHECK HOLD STATUS
// ============================================================

export const getSeatHoldStatus = async (
  eventId,
  seatId
) => {
  const response = await apiClient.get(
    "/bookings/hold-status/",
    {
      params: {
        event: eventId,
        seat: seatId,
      },
    }
  );

  return response.data;
};

// ============================================================
// CREATE BOOKING
// ============================================================

export const createBooking = async (
  eventId,
  seatId
) => {

  const response = await apiClient.post(
    "/bookings/",
    {
      event: eventId,
      seat: seatId,
    }
  );

  return response.data;
};

// ============================================================
// GET MY BOOKINGS
// ============================================================

export const getMyBookings = async () => {

  const response = await apiClient.get(
    "/bookings/my-bookings/"
  );

  return response.data;
};

// ============================================================
// CANCEL BOOKING
// ============================================================

export const cancelBooking = async (
  bookingId
) => {

  const response = await apiClient.patch(
    `/bookings/${bookingId}/cancel/`
  );

  return response.data;
};