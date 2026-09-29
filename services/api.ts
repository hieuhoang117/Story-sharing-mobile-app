import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://172.20.10.2:3000/api',
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email: string, password: string) => {
  return api.post('/users/login', { email, password });
};
export const getUserById = (id: string) => {
  return api.get(`/users/${id}`);
};
export const getpostbyuserid = (user_id: string) => {
  return api.get(`/posts/postbyuser/${user_id}`);
};

export default api;