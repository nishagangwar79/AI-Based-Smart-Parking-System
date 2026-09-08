import api from './api';

export const getParkingLots = async (params = {}) => {
  const { data } = await api.get('/parking-lots', { params });
  return data.data;
};

export const getParkingLotById = async (id) => {
  const { data } = await api.get(`/parking-lots/${id}`);
  return data.data;
};

export const createParkingLot = async (lotData) => {
  const { data } = await api.post('/parking-lots', lotData);
  return data.data;
};

export const updateParkingLot = async (id, lotData) => {
  const { data } = await api.put(`/parking-lots/${id}`, lotData);
  return data.data;
};

export const deleteParkingLot = async (id) => {
  const { data } = await api.delete(`/parking-lots/${id}`);
  return data;
};

export const getParkingSlots = async (params = {}) => {
  const { data } = await api.get('/parking-slots', { params });
  return data.data;
};

export const getParkingSlotById = async (id) => {
  const { data } = await api.get(`/parking-slots/${id}`);
  return data.data;
};

export const createParkingSlot = async (slotData) => {
  const { data } = await api.post('/parking-slots', slotData);
  return data.data;
};

export const updateParkingSlot = async (id, slotData) => {
  const { data } = await api.put(`/parking-slots/${id}`, slotData);
  return data.data;
};

export const deleteParkingSlot = async (id) => {
  const { data } = await api.delete(`/parking-slots/${id}`);
  return data;
};

export const updateSlotStatus = async (id, status) => {
  const { data } = await api.put(`/admin/parking-slots/${id}/status`, { status });
  return data.data;
};
