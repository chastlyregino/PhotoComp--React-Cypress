import axios from 'axios';

const AXIOS_DEFAULTS = {
    baseURL: 'http://54.242.98.94:3000',
    headers: {
        'Content-Type': 'application/json',
    },
};

export const noAuthInstance = axios.create(AXIOS_DEFAULTS);

const axiosInstance = axios.create(AXIOS_DEFAULTS);

axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        console.error('API error:', error);
        return Promise.reject(error);
    }
);

export default axiosInstance;
