import API from './axios.js';

export const createBookingAPI = async(bookingData) => {
    const response = await API.post('/bookings', bookingData);
    return response.data;
};


export const getMyBookingsAPI = async () => {
  const response = await API.get('/bookings/mine');
  return response.data;
};


export const updateBookingStatusAPI = async (bookingId, status) => {
  const response = await API.put(`/bookings/${bookingId}`, { status });
  return response.data;
};
