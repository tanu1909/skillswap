import API from './axios.js';

export const registerAPI = async (userData) => {
  try {
    const response = await API.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const loginAPI = async (userData) => {
  try {
    const response = await API.post('/auth/login', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};