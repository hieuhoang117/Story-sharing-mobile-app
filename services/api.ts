import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://192.168.1.52:3000/api',
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
export const searchUsers = (username: string) => {
  return api.get('/users/search', { params: { username } });
};
export const getpostbyuserid = (user_id: string) => {
  return api.get(`/posts/postbyuser/${user_id}`);
};

//uploadpic---------------
type ImageUploadAsset = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export const uploadpic = (image: ImageUploadAsset) => {
  const formData = new FormData();
  formData.append('avatar', {
    uri: image.uri,
    name: image.fileName ?? 'avatar.jpg',
    type: image.mimeType ?? 'image/jpeg',
  } as unknown as Blob);

  return api.post('/uploads/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export default api;