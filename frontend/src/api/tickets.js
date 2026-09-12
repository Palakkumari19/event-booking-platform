import apiClient from "./client";

export const getMyTickets = async () => {
  const response = await apiClient.get("/tickets/my-tickets/");
  return response.data;
};

export const getTicket = async (ticketId) => {
  const response = await apiClient.get(`/tickets/${ticketId}/`);
  return response.data;
};

export const validateTicket = async (ticketNumber) => {
  const response = await apiClient.post(
    "/tickets/validate/",
    {
      ticket_number: ticketNumber,
    }
  );

  return response.data;
};