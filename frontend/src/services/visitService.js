import api from './api.js';

export const visitService = {
  async requestVisit(propertyId, data) {
    const res = await api.post(`/api/properties/${propertyId}/visits`, data);
    return res.data;
  },

  async getMyVisits() {
    const res = await api.get('/api/visits/my');
    return res.data;
  },

  async getReceivedVisits() {
    const res = await api.get('/api/visits/received');
    return res.data;
  },

  async updateVisitStatus(id, status, sellerNote = '') {
    const res = await api.patch(`/api/visits/${id}/status`, { status, sellerNote });
    return res.data;
  }
};

export default visitService;
