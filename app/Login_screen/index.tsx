import { router } from 'expo-router';
import { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { useAuth } from './../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setIsLoggedIn } = useAuth();

  const handleLogin = () => {
    // TODO: gọi API kiểm tra tài khoản thật ở đây
    setIsLoggedIn(true);
    router.replace('/main_screen');// chuyển sang màn hình chính
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Đăng nhập" onPress={handleLogin} />
    </View>
  );
}