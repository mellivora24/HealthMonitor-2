import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
    return (
        <>
            <StatusBar style="auto" />
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="splash" options={{ headerShown: false }} />
                <Stack.Screen name="welcome" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="modals/edit-profile"
                    options={{
                        presentation: 'modal',
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="modals/health-history"
                    options={{
                        presentation: 'modal',
                        headerShown: false,
                    }}
                />
            </Stack>
        </>
    );
}
