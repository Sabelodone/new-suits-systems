import axios from 'axios';

// ── Base URL ────────────────────────────────────────────────────────────────
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  'https://suits-webapp-backend.onrender.com';

// ── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // 🔥 FIX: ALIGNMENT OF STORAGE KEYS
    const token = localStorage.getItem('accessToken');
    const tenantCode = localStorage.getItem('tenantCode');

    // Attach JWT token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Attach tenant code
    if (tenantCode) {
      config.headers['X-Tenant-Code'] = tenantCode;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token — user must log in again');
        }

        const refreshResponse = await axios.post(
          `${BASE_URL}/api/auth/refresh/`,
          { refresh: refreshToken }
        );

        const { access: newAccessToken } = refreshResponse.data;

        // 🔥 FIX: consistent key
        localStorage.setItem('accessToken', newAccessToken);

        originalRequest.headers[
          'Authorization'
        ] = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.warn('Session expired. Redirecting to login.');

        // 🔥 FIX: consistent cleanup keys
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tenantCode');
        localStorage.removeItem('user');

        window.location.href = '/signin';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;