import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getToken } from '../utils/token';
import { useAuthStore } from '../store/auth.store';
import { Colors } from '../constants/colors';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  const { isAuthenticated, isLoading, setToken, setLoading } = useAuthStore();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) await setToken(token);
      setLoading(false);
    })();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}
