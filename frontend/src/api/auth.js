import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export const registerUser = async (userData) => {
  const response = await axios.post(
    `${API_URL}/auth/register/`,
    userData
  );

  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(
    `${API_URL}/auth/login/`,
    credentials
  );

  return response.data;
};

export const getCurrentUser = async (accessToken) => {
  const response = await axios.get(
    `${API_URL}/auth/me/`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const refreshAccessToken = async (refreshToken) => {
  const response = await axios.post(
    `${API_URL}/auth/refresh/`,
    {
      refresh: refreshToken,
    }
  );

  return response.data;
};