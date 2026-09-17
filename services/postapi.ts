import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.23:3000/api', // đổi thành IP máy bạn nếu test bằng điện thoại thật
});
export const getpostById = (id: string) => {
  return api.get(`/posts/${id}`);
}



export default api;