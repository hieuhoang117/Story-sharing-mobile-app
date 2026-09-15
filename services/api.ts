import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.20.10.2:3000/api', // đổi thành IP máy bạn nếu test bằng điện thoại thật
});
export const login = (email: string, password: string) => {
  return api.post('/users/login', { email, password });
};
export const getUserById = (id: string) => {
  return api.get(`/users/${id}`);
};
export const getpostbyuserid=(user_id:string)=>{
  return api.get(`/posts/postbyuser/`)
}



export default api;