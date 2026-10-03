import { createContext, ReactNode, useContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

type AuthContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  idUser: string;
  setidUser: (value: string) => void;
  avatar: string;
  setavatar: (value: string) => void;
  displayname: string;
  setdisplayname: (value: string) => void;
  username: string;
  setusername: (value: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [idUser, setidUser] = useState('');
  const [avatar, setavatar] = useState('');
  const [displayname, setdisplayname] = useState('');
  const [username, setusername] = useState('');

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
    } finally {
      setIsLoggedIn(false);
      setidUser('');
      setavatar('');
      setdisplayname('');
      setusername('');
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn, setIsLoggedIn,
      idUser, setidUser,
      avatar, setavatar,
      displayname, setdisplayname,
      username, setusername,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
};