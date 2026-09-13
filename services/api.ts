import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.11:3000/api', // đổi thành IP máy bạn nếu test bằng điện thoại thật
});
export const login = (email: string, password: string) => {
  return api.post('/users/login', { email, password });
};
export default api;