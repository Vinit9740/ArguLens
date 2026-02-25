import axios from 'axios';

const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;

const axiosInstance = axios.create({
    baseURL: '/api',
    timeout: 120000, // 2 min timeout for AI inference
});

// Attach static access token + any stored session JWT
axiosInstance.interceptors.request.use((config) => {
    config.headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;

    const sessionToken = localStorage.getItem('argulens_session');
    if (sessionToken) {
        config.headers['X-Session-Token'] = sessionToken;
    }

    return config;
});

// Store session JWT returned from server
axiosInstance.interceptors.response.use(
    (response) => {
        const newToken = response.headers['x-auth-token'];
        if (newToken) {
            localStorage.setItem('argulens_session', newToken);
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
