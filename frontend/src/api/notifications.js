import apiClient from "./client";

export const getNotifications = async () => {
  const response = await apiClient.get("/notifications/");
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await apiClient.patch(
    `/notifications/${notificationId}/read/`
  );

  return response.data;
};