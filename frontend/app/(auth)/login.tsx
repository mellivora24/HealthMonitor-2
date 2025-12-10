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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Đăng nhập</Text>
                    <Text style={styles.subtitle}>Chào mừng trở lại!</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email"
                        placeholder="Nhập email"
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
                        placeholder="Nhập mật khẩu"
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

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Chưa có tài khoản? </Text>
                        <Button
                            title="Đăng ký ngay"
                            onPress={handleRegister}
                            variant="outline"
                            size="small"
                        />
                    </View>
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
        paddingVertical: SPACING.xl,
    },
    header: {
        marginTop: SPACING.xl * 2,
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
    },
    form: {
        flex: 1,
    },
    loginButton: {
        marginTop: SPACING.md,
    },
    registerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.xl,
    },
    registerText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
    },
});