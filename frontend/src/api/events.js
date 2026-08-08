import apiClient from "./client";

export const getEvents = async () => {
  const response = await apiClient.get("/events/");
  return response.data;
};

export const getEvent = async (eventId) => {
  const response = await apiClient.get(
    `/events/${eventId}/`,
  );

  return response.data;
};