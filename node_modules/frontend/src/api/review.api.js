import API from './axios.js';

// Submit review feedback payload
export const createReviewAPI = async (reviewData) => {
  const response = await API.post('/reviews', reviewData);
  return response.data;
};

// Fetch review feedback logs for a target user
export const getUserReviewsAPI = async (userId) => {
  const response = await API.get(`/reviews/user/${userId}`);
  return response.data;
};