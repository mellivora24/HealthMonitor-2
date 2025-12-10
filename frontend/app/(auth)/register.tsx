import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { useAuthStore } from '../../src/store/authStore';
import { validators } from '../../src/utils/validation';
import { COLORS, SPACING, FONT_SIZES } from '../../src/constants/theme';

export default function RegisterScreen() {
    const router = useRouter();
    const { register, isLoading } = useAuthStore();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
    });

    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
    });

    const validateForm = (): boolean => {
        const newErrors = {
            email: validators.email(formData.email) || '',
            password: validators.password(formData.password) || '',
            confirmPassword: formData.password !== formData.confirmPassword ? 'Mật khẩu không khớp' : '',
            full_name: validators.fullName(formData.full_name) || '',
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error);
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        try {
            await register({
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
            });
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Lỗi đăng ký', error.message || 'Đã xảy ra lỗi');
        }
    };

    const handleLogin = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Đăng ký</Text>
                    <Text style={styles.subtitle}>Tạo tài khoản mới</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Họ và tên"
                        placeholder="Nhập họ và tên"
                        value={formData.full_name}
                        onChangeText={(text) => {
                            setFormData({ ...formData, full_name: text });
                            setErrors({ ...errors, full_name: '' });
                        }}
                        error={errors.full_name}
                    />

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
                        placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                        value={formData.password}
                        onChangeText={(text) => {
                            setFormData({ ...formData, password: text });
                            setErrors({ ...errors, password: '' });
                        }}
                        error={errors.password}
                        isPassword
                    />

                    <Input
                        label="Xác nhận mật khẩu"
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChangeText={(text) => {
                            setFormData({ ...formData, confirmPassword: text });
                            setErrors({ ...errors, confirmPassword: '' });
                        }}
                        error={errors.confirmPassword}
                        isPassword
                    />

                    <Button
                        title="Đăng ký"
                        onPress={handleRegister}
                        isLoading={isLoading}
                        style={styles.registerButton}
                    />

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Đã có tài khoản? </Text>
                        <Button
                            title="Đăng nhập"
                            onPress={handleLogin}
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
        marginTop: SPACING.xl,
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
    registerButton: {
        marginTop: SPACING.md,
    },
    loginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.xl,
    },
    loginText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
    },
});