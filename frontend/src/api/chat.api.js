import API from './axios.js';

// retrieve chat conversation history with a specific peer
export const getChatHistoryAPI = async (counterpartId) => {
  const response = await API.get(`/chat/${counterpartId}`);
  return response.data;
};