import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    const isAuthRoute = url.includes('/auth/');
    const isCartRoute = url.includes('/cart');
    const isOnLoginPage = window.location.pathname === '/login';

    if (status === 401 && !isAuthRoute && !isCartRoute && !isOnLoginPage) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;