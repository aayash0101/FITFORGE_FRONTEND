import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthRoute = url.includes('/auth/');
    const is401 = error.response?.status === 401;
    const isOnLoginPage = window.location.pathname === '/login';

    if (is401 && !isAuthRoute && !isOnLoginPage) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;