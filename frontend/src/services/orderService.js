import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

const getAuthConfig = () => {
  const token = sessionStorage.getItem("goviToken");

  if (!token) {
    throw new Error("Please log in to access your orders.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(
      API_URL,
      orderData,
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Order error response:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllOrders = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    getAuthConfig()
  );

  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await axios.patch(
    `${API_URL}/${id}/status`,
    { status },
    getAuthConfig()
  );

  return response.data;
};
