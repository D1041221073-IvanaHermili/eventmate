import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEY = 'taskmate_auth_token';
const USER_KEY = 'taskmate_user_data';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 🔹 Load saved auth data on app start
  useEffect(() => {
    async function loadAuth() {
      try {
        console.log('🔄 Loading saved auth data...');
        const isSecureStoreAvailable = await SecureStore.isAvailableAsync();
        let storedToken = null;
        let storedUser = null;

        if (isSecureStoreAvailable) {
          storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
          storedUser = await SecureStore.getItemAsync(USER_KEY);
        } else {
          storedToken = localStorage.getItem(TOKEN_KEY);
          storedUser = localStorage.getItem(USER_KEY);
        }

        if (storedToken && storedUser) {
          console.log('✅ Auth data found, restoring session');
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          console.log('ℹ️ No saved auth data found');
        }
      } catch (error) {
        console.error('❌ Failed to load auth data:', error);
      } finally {
        setIsLoading(false);
        console.log('✅ Auth initialization complete');
      }
    }

    loadAuth();
  }, []);

  // 🔹 Redirect hanya sekali setelah auth selesai dimuat
  useEffect(() => {
    if (!isLoading) {
      if (user && token) {
        console.log('🔐 User logged in, staying on main page');
        // 👉 jangan redirect lagi kalau sudah di halaman utama
      } else {
        console.log('🔓 No user logged in, redirecting to login...');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        } else {
          router.replace('/(auth)/login');
        }
      }
    }
  }, [isLoading]);

  // 🔹 Login function
  const login = async (newToken, userData) => {
    try {
      console.log('💾 Saving auth data...');
      const isSecureStoreAvailable = await SecureStore.isAvailableAsync();

      if (isSecureStoreAvailable) {
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
      } else {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }

      setToken(newToken);
      setUser(userData);

      console.log('✅ Login success, redirecting to home...');
      if(userData.role === 'admin'){
        router.replace('/(admin)')
      } else {
        router.replace('/(user)')
      }      
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error during login:', error);
      return { success: false, error: error.message };
    }
  };

  // 🔹 Register function
  const register = async (newToken, userData) => {
    try {
      console.log('💾 Saving registration data...');
      const isSecureStoreAvailable = await SecureStore.isAvailableAsync();

      if (isSecureStoreAvailable) {
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
      } else {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }

      setToken(newToken);
      setUser(userData);

      console.log('✅ Registration success, redirecting...');
      router.replace('/(tabs)');
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving registration data:', error);
      return { success: false, error: error.message };
    }
  };

  // 🔹 Logout function
  const logout = async () => {
    try {
      console.log('👋 Logging out...');
      const isSecureStoreAvailable = await SecureStore.isAvailableAsync();

      if (isSecureStoreAvailable) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }

      setToken(null);
      setUser(null);

      console.log('✅ Logged out, redirecting...');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
