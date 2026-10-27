
import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

export const createOrder = async (orderData) => {
  const response = await axios.post(API_URL, orderData);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await axios.patch(`${API_URL}/${id}/status`, {
    status,
  });
  return response.data;
};
