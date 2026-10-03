import { Stack } from 'expo-router';

export default function LoginLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" ></Stack.Screen>
      <Stack.Screen
        name="signin"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          title: 'Tạo tài khoản',
        }}
      />
    </Stack>
  );
}