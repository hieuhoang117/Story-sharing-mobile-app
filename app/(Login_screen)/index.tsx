import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setIsLoggedIn,setidUser } = useAuth();

  const handleLogin = () => {
    try {
      api.post('/users/login', { email, password })
        .then(response => {
          // Xử lý phản hồi từ API
          setidUser(response.data.data.ser_id)
          setIsLoggedIn(true);
          router.replace('/main_screen');
        })
        .catch(error => {
          // Xử lý lỗi từ API
          console.error('Login failed:', error);
        });
    } catch (error) {
      console.error('An error occurred during login:', error);
    }
  };
  const stylebackgroud = StyleSheet.create({
    background: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black',
    },
  });
  const styleinput = StyleSheet.create({
    input: {
      width: '80%',
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 10,
      borderRadius: 9,
      color: 'white',
    },
  });
  const stylebutton = StyleSheet.create({
    button: {
      width: '80%',
      height: 40,
      backgroundColor: '#007bff',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
    },
  });

  return (
    <View style={ stylebackgroud.background }>
      <Image source={require('../../assets/images/Logo.png')} style={{ width: 100, height: 100, marginBottom: 20 }} />
      <TextInput textContentType="emailAddress" placeholderTextColor="gray" style={ styleinput.input } placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput textContentType="password" placeholderTextColor="gray" style={ styleinput.input } placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Pressable style={ stylebutton.button } onPress={handleLogin}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Đăng nhập</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/')}>
        <Text style={{ color: '#007bff', marginTop: 10 }}>Quên mật khẩu?</Text>
      </Pressable>
    </View>
  );
}