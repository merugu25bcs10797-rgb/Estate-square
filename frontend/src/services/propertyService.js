import api from './api.js';

export const propertyService = {
  async getProperties(params = {}) {
    const res = await api.get('/api/properties', { params });
    return res.data;
  },

  async getPropertyById(id) {
    const res = await api.get(`/api/properties/${id}`);
    return res.data;
  },

  async getMyProperties() {
    const res = await api.get('/api/properties/my');
    return res.data;
  },

  async createProperty(formData) {
    const res = await api.post('/api/properties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  async updateProperty(id, formData) {
    const res = await api.put(`/api/properties/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  async deleteProperty(id) {
    const res = await api.delete(`/api/properties/${id}`);
    return res.data;
  },

  async getPendingProperties() {
    const res = await api.get('/api/admin/properties/pending');
    return res.data;
  },

  async approveProperty(id) {
    const res = await api.patch(`/api/admin/properties/${id}/approve`);
    return res.data;
  },

  async rejectProperty(id, reason) {
    const res = await api.patch(`/api/admin/properties/${id}/reject`, { reason });
    return res.data;
  }
};

export default propertyService;
