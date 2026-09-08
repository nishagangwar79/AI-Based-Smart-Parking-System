import api from './api';

export const getRecommendation = async (payload) => {
  const { data } = await api.post('/ai/recommend', payload);
  return data.data;
};

export const getPrediction = async (parkingLotId = null) => {
  const { data } = await api.post('/ai/predict', { parkingLotId });
  return data.data;
};

export const sendChatMessage = async (message) => {
  const { data } = await api.post('/ai/chat', { message });
  return data.data;
};
