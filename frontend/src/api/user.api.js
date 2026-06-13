import API from './axios.js';

export const searchUsersBySkillAPI = async (skill) => {
  const q = encodeURIComponent(skill);
  const response = await API.get(`/users/search?skill=${q}`);
  return response.data;
};


export const updateMyProfileAPI = async (profileData) => {
  const response = await API.put('/users/me', profileData);
  return response.data;
};

export const getUserProfileAPI = async (id) => {
  const response = await API.get(`/users/${id}`);
  return response.data;
};