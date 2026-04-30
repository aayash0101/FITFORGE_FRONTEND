import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Only redirect to login if it's NOT the /auth/me check
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCheck = error.config?.url === '/auth/me';
    const is401 = error.response?.status === 401;

    if (is401 && !isAuthCheck) {
      // Token expired mid-session — redirect to login
      window.location.href = '/login';
    }

    // Always reject so the calling code can handle the error
    return Promise.reject(error);
  }
);

export default api;