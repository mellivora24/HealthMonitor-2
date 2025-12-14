import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { useAuthStore } from '../../src/store/authStore';
import { validators } from '../../src/utils/validation';
import { COLORS, SPACING, FONT_SIZES } from '../../src/constants/theme';

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading } = useAuthStore();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });

    const validateForm = (): boolean => {
        const newErrors = {
            email: validators.email(formData.email) || '',
            password: validators.password(formData.password) || '',
        };

        setErrors(newErrors);
        return !newErrors.email && !newErrors.password;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        try {
            await login(formData);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Lỗi đăng nhập', error.message || 'Đã xảy ra lỗi');
        }
    };

    const handleRegister = () => {
        router.push('/(auth)/register');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logo}>
                            <Text style={styles.logoText}>📱</Text>
                        </View>
                    </View>
                    <Text style={styles.title}>Chào mừng trở lại</Text>
                    <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
                </View>

                <View style={styles.formCard}>
                    <Input
                        label="Email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChangeText={(text) => {
                            setFormData({ ...formData, email: text });
                            setErrors({ ...errors, email: '' });
                        }}
                        error={errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="Mật khẩu"
                        placeholder="Nhập mật khẩu của bạn"
                        value={formData.password}
                        onChangeText={(text) => {
                            setFormData({ ...formData, password: text });
                            setErrors({ ...errors, password: '' });
                        }}
                        error={errors.password}
                        isPassword
                    />

                    <Button
                        title="Đăng nhập"
                        onPress={handleLogin}
                        isLoading={isLoading}
                        style={styles.loginButton}
                    />
                </View>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>hoặc</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Chưa có tài khoản?</Text>
                    <Button
                        title="Đăng ký ngay"
                        onPress={handleRegister}
                        variant="outline"
                        size="small"
                        style={styles.registerButton}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.xl * 3,
        paddingBottom: SPACING.xl * 2,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl * 2,
    },
    logoContainer: {
        marginBottom: SPACING.xl,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    logoText: {
        fontSize: 40,
    },
    title: {
        fontSize: FONT_SIZES.xxl + 4,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontWeight: '400',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: SPACING.xl,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    loginButton: {
        marginTop: SPACING.lg,
        borderRadius: 12,
        height: 56,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.xl,
        paddingHorizontal: SPACING.md,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border || '#E5E5E5',
    },
    dividerText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginHorizontal: SPACING.md,
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
        marginTop: SPACING.md,
    },
    footerText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
        fontWeight: '400',
    },
    registerButton: {
        minWidth: 140,
        borderRadius: 12,
    },
});
