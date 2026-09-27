import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setIsLoggedIn, setidUser, setavatar, setdisplayname, setusername } = useAuth();

  const handleLogin = () => {
    if (email == null||email.length == 0 || password == null|| password.length == 0) {
      Alert.alert('Thông báo', 'Hãy nhập tài khoản và mật khẩu');
      return
    }
    try {
      api.post('/users/login', { email, password })
        .then(async response => {
          const user = response.data.data;

          await SecureStore.setItemAsync('userToken', user.token);

          setidUser(user.id);
          setavatar(user.avatar_url);
          setdisplayname(user.display_name);
          setusername(user.username);
          setIsLoggedIn(true);
          router.replace('/main_screen');
        })
        .catch(error => {
          Alert.alert('Thông báo', 'Sai tai khoan hoac mat khau');
        });
    } catch (error) {
      console.error('An error occurred during login:', error);
    }
  };

  return (
    <View style={stylebackgroud.background}>
      <Image source={require('../../assets/images/Logo.png')} style={{ width: 100, height: 100, marginBottom: 20 }} />
      <TextInput textContentType="emailAddress" placeholderTextColor="gray" style={styleinput.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput textContentType="password" placeholderTextColor="gray" style={styleinput.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Pressable style={stylebutton.button} onPress={handleLogin}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Đăng nhập</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/')}>
        <Text style={{ color: '#007bff', marginTop: 10 }}>Quên mật khẩu?</Text>
      </Pressable>
    </View>
  );
}

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