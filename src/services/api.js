import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ak_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Ne plus forcer la redirection vers /login sur toute 401 — ça bloque le checkout invité
    if (err.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('ak_token');
      localStorage.removeItem('ak_user');
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login:    (d) => api.post('/auth/login', d),
  getMe:    ()  => api.get('/auth/me'),
};
export const carAPI = {
  getAll:        (p)    => api.get('/cars', { params: p }),
  getById:       (id)   => api.get(`/cars/${id}`),
  getCategories: ()     => api.get('/cars/categories'),
  getBrands:     ()     => api.get('/cars/brands'),
  create:        (formData) => {
    return api.post('/cars', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },
  update:        (id, formData) => {
    return api.put(`/cars/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },
  toggle:        (id)   => api.patch(`/cars/${id}/toggle`),
  remove:        (id)   => api.delete(`/cars/${id}`),
};
export const cartAPI = {
  get:    ()      => api.get('/cart'),
  count:  ()      => api.get('/cart/count'),
  add:    (d)     => api.post('/cart', d),
  remove: (carId) => api.delete(`/cart/${carId}`),
};
export const orderAPI = {
  create:         (d) => {
    const isForm = d instanceof FormData;
    return api.post('/orders', d, isForm ? {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    } : undefined);
  },
  getMy:          ()     => api.get('/orders/my'),
  getByNumber:    (num)  => api.get(`/orders/${num}`),
  track:          (num)  => api.get(`/orders/track/${num}`),
  getAll:         (p)    => api.get('/orders', { params: p }),
  getAdminDetail: (id)   => api.get(`/orders/${id}`),
  updateStatus:   (id,d) => api.patch(`/orders/${id}`, d),
  remove:         (id)   => api.delete(`/orders/${id}`),
  addPayment:     (id,d) => api.post(`/orders/${id}/payments`, d),
  updatePayment:  (id,d) => api.patch(`/admin/payments/${id}`, d),
  byEmail:        (email) => api.get('/orders/by-email', { params: { email } }),
};
export const bankAPI = {
  get:     ()  => api.get('/bank'),
  getAdmin:()  => api.get('/admin/bank'),
  update:  (d) => api.put('/admin/bank', d),
};
export const simAPI = {
  simulate: (salary) => api.get('/simulation', { params: { salary } }),
};
export const adminAPI = {
  stats:        () => api.get('/admin/stats'),
  clients:      () => api.get('/admin/clients'),
  getCars:      () => api.get('/admin/cars'),
  deleteClient: (id) => api.delete(`/admin/clients/${id}`),
};
export const userAPI = {
  updateProfile:  (d) => api.put('/user/profile', d),
  changePassword: (d) => api.put('/user/password', d),
};

export default api;
