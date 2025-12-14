import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../src/constants/theme';

export default function SplashScreen() {
    const router = useRouter();
    const hasNavigated = useRef(false); // Prevent multiple navigations

    useEffect(() => {
        if (hasNavigated.current) return;
        
        const timer = setTimeout(() => {
            hasNavigated.current = true;
            router.replace('/welcome');
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <View style={styles.logo}>
                    <Text style={styles.logoText}>H</Text>
                </View>
                <Text style={styles.title}>Health Monitor</Text>
                <Text style={styles.subtitle}>Theo dõi sức khỏe thông minh</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    logoText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.card,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.card,
        opacity: 0.9,
    },
});
