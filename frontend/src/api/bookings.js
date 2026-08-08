import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export const getEventSeats = async (eventId) => {
  const response = await axios.get(
    `${API_URL}/bookings/seats/?event=${eventId}`
  );

  return response.data;
};


// ---------------------------------------
// Hold a seat
// ---------------------------------------
export const holdSeat = async (
  eventId,
  seatId,
  accessToken
) => {
  const response = await axios.post(
    `${API_URL}/bookings/hold/`,
    {
      event: eventId,
      seat: seatId,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};


// ---------------------------------------
// Check hold status
// ---------------------------------------
export const getSeatHoldStatus = async (
  eventId,
  seatId,
  accessToken
) => {
  const response = await axios.get(
    `${API_URL}/bookings/hold-status/`,
    {
      params: {
        event: eventId,
        seat: seatId,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};