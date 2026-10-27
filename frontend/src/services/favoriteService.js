import api from './api.js';

export const favoriteService = {
  async toggleFavorite(propertyId) {
    const res = await api.post(`/api/properties/${propertyId}/favorite`);
    return res.data;
  },

  async getMyFavorites() {
    const res = await api.get('/api/favorites');
    return res.data;
  }
};

export default favoriteService;
