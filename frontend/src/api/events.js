import apiClient from "./client";

export const getEvents = async (filters = {}) => {
  const params = {};

  if (filters.search?.trim()) {
    params.search = filters.search.trim();
  }

  if (filters.venue?.trim()) {
    params.venue = filters.venue.trim();
  }

  if (filters.upcoming) {
    params.upcoming = "true";
  }

  if (filters.ordering) {
    params.ordering = filters.ordering;
  }

  const response = await apiClient.get("/events/", {
    params,
  });

  return response.data;
};

export const getEvent = async (eventId) => {
  const response = await apiClient.get(`/events/${eventId}/`);
  return response.data;
};

export const getEventSeats = async (eventId) => {
  const response = await apiClient.get(
    `/events/${eventId}/seats/`
  );

  return response.data;
};

export const getOrganizerEvents = async () => {
  const response = await apiClient.get(
    "/events/organizer/"
  );

  return response.data;
};

export const createOrganizerEvent = async (eventData) => {
  const response = await apiClient.post(
    "/events/organizer/create/",
    eventData
  );

  return response.data;
};

export const getOrganizerEvent = async (eventId) => {
  const response = await apiClient.get(
    `/events/organizer/${eventId}/`
  );

  return response.data;
};

export const updateOrganizerEvent = async (
  eventId,
  eventData
) => {
  const response = await apiClient.put(
    `/events/organizer/${eventId}/`,
    eventData
  );

  return response.data;
};

export const publishOrganizerEvent = async (eventId) => {
  const response = await apiClient.patch(
    `/events/organizer/${eventId}/publish/`
  );

  return response.data;
};

export const cancelOrganizerEvent = async (eventId) => {
  const response = await apiClient.patch(
    `/events/organizer/${eventId}/cancel/`
  );

  return response.data;
};