import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from './context/AuthContext';

function RootNavigation() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <Stack.Screen name="Login_screen" />
      ) : (
        <Stack.Screen name="Main_screen" />
      )}
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
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