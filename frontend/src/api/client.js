import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://nt208-reddit-like-comment-system-1.onrender.com/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm token vào header cho mỗi request
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý lỗi 401 (token hết hạn)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect tới login page nếu cần
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function getApiError(error, defaultMessage = "Lỗi API") {
	try {
		if (!error) return new Error(defaultMessage);
		const resp = error.response;
		if (resp?.data) {
			const data = resp.data;
			if (typeof data === "string") return new Error(data);
			if (data.message) return new Error(data.message);
			if (data.error) return new Error(data.error);
		}
		if (error.message) return new Error(error.message);
		return new Error(defaultMessage);
	} catch {
		return new Error(defaultMessage);
	}
}

export default client;
