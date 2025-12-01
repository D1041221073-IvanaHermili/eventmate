// src/services/api.js
import axios from "axios";

const API_URL = "http://localhost:4000/api"; // <-- FIX PENTING UNTUK WEB

export default function createApi(token) {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
  });

  instance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
}
