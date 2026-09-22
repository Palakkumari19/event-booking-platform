import apiClient from "./client";

export const getVenues = async () => {
  const response = await apiClient.get("/venues/");
  return response.data;
};

export const getVenueSections = async (venueId) => {
  const response = await apiClient.get(
    `/venues/${venueId}/sections/`
  );
  return response.data;
};