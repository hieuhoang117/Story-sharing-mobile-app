import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootNavigation() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(Login_screen)" options={{ headerBackButtonDisplayMode: 'minimal' }} />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="main_screen" />
        <Stack.Screen name="profile" options={{ headerBackButtonDisplayMode: 'minimal' }} />
        <Stack.Screen
          name="create-post"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            title: 'Tạo bài viết',
          }}></Stack.Screen>
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}