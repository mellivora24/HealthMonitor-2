import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    async function prepare() {
      try {
        const isAuthenticated = await checkAuth();
        
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/splash');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/splash');
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}