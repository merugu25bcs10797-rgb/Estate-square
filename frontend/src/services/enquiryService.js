import api from './api.js';

export const enquiryService = {
  async sendEnquiry(propertyId, data) {
    const res = await api.post(`/api/properties/${propertyId}/enquiries`, data);
    return res.data;
  },

  async getMyEnquiries() {
    const res = await api.get('/api/enquiries/my');
    return res.data;
  },

  async getReceivedEnquiries() {
    const res = await api.get('/api/enquiries/received');
    return res.data;
  },

  async updateEnquiryStatus(id, status) {
    const res = await api.patch(`/api/enquiries/${id}/status`, { status });
    return res.data;
  }
};

export default enquiryService;
