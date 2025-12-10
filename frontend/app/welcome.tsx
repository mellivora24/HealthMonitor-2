import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../src/components/common/Button';
import { useAuthStore } from '../src/store/authStore';
import { COLORS, SPACING, FONT_SIZES } from '../src/constants/theme';

export default function WelcomeScreen() {
    const router = useRouter();
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
            router.replace('/(tabs)');
        }
    };

    const handleContinue = () => {
        router.push('/(auth)/login');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>H</Text>
                    </View>
                </View>

                <Text style={styles.title}>Chào mừng đến với{'\n'}Health Monitor</Text>
                <Text style={styles.description}>
                    Theo dõi sức khỏe của bạn mọi lúc mọi nơi với các chỉ số sức khỏe theo thời gian thực
                </Text>

                <View style={styles.features}>
                    <FeatureItem icon="💓" text="Nhịp tim" />
                    <FeatureItem icon="🫁" text="SpO2" />
                    <FeatureItem icon="🌡️" text="Nhiệt độ" />
                    <FeatureItem icon="🩺" text="Huyết áp" />
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    title="Tiếp tục"
                    onPress={handleContinue}
                    variant="primary"
                    size="large"
                    style={styles.button}
                />
            </View>
        </View>
    );
}

const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
    <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>{icon}</Text>
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.xl,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.card,
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    description: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: 24,
    },
    features: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: SPACING.md,
    },
    featureItem: {
        alignItems: 'center',
        width: '40%',
    },
    featureIcon: {
        fontSize: 40,
        marginBottom: SPACING.xs,
    },
    featureText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text,
    },
    footer: {
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.xl,
    },
    button: {
        width: '100%',
    },
});
