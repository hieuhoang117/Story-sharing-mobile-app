import { Button } from "antd";
import { useNavigate } from "react-router-dom";
export default function Login() {
    const navigate = useNavigate()
    return (<Button onClick={() => navigate('/admin')}>Đăng nhập</Button>)
}