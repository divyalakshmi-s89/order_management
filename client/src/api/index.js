import axios from 'axios';
const api = axios.create({ baseURL: '/api', timeout: 10000 });
api.interceptors.response.use(
  r => r.data,
  e => Promise.reject(new Error(e.response?.data?.error || e.message || 'Request failed'))
);
export const ordersAPI = {
  getAll: ()       => api.get('/orders'),
  create: d        => api.post('/orders', d),
  update: (id, d)  => api.put(`/orders/${id}`, d),
  remove: id       => api.delete(`/orders/${id}`)
};
export const dashboardAPI = {
  load: (uid='admin') => api.get(`/dashboard/${uid}`),
  save: payload       => api.post('/dashboard/save', payload)
};
export const analyticsAPI = {
  getData:  p => api.get('/analytics/data',     { params: p }),
  getKPI:   p => api.get('/analytics/kpi',      { params: p }),
  getProds: () => api.get('/analytics/products')
};
export default api;
