import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const api = axios.create({
  baseURL: "https://sal.notespad.xyz/api", // ganti sesuai API kamu
  withCredentials: true, // kalau pakai cookie JWT baru true
});

// Interceptor: tambahin Authorization otomatis kecuali login/refresh
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");

    // jangan tambah Authorization kalau endpoint login/refresh
    if (
      token &&
      config.url &&
      !config.url.includes("/auth/login") &&
      !config.url.includes("/auth/refresh")
    ) {
      if (!config.headers) config.headers = {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: any) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => Promise.reject(error)
);

export default api;
