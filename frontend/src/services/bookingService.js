import api from './api';

export const createBooking = async (bookingData) => {
  const { data } = await api.post('/bookings', bookingData);
  return data.data;
};

export const getMyBookings = async () => {
  const { data } = await api.get('/bookings/my');
  return data.data;
};

export const getBookingById = async (id) => {
  const { data } = await api.get(`/bookings/${id}`);
  return data.data;
};

export const cancelBooking = async (id) => {
  const { data } = await api.put(`/bookings/${id}/cancel`);
  return data.data;
};

export const getProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data.data;
};

export const updateProfile = async (profileData) => {
  const { data } = await api.put('/users/profile', profileData);
  return data.data;
};

export const getAdminDashboard = async () => {
  const { data } = await api.get('/admin/dashboard');
  return data.data;
};

export const getAdminUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data.data;
};

export const getAdminBookings = async () => {
  const { data } = await api.get('/admin/bookings');
  return data.data;
};
