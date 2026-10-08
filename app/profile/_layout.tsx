import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack>
      <Stack.Screen name="index"
      options={{title:''}} />
      <Stack.Screen name="changepass" options={{title:'Đổi mật khẩu',headerBackButtonDisplayMode: 'minimal'}}></Stack.Screen>
    </Stack>
  );
}