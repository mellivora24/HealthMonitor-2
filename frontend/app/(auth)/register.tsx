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
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Tạo tài khoản mới</Text>
                    <Text style={styles.subtitle}>Đăng ký để bắt đầu</Text>
                </View>

                <View style={styles.formCard}>
                    <Input
                        label="Họ và tên"
                        placeholder="Nguyễn Văn A"
                        value={formData.full_name}
                        onChangeText={(text) => {
                            setFormData({ ...formData, full_name: text });
                            setErrors({ ...errors, full_name: '' });
                        }}
                        error={errors.full_name}
                    />

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
                        placeholder="Tối thiểu 8 ký tự"
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
                </View>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>hoặc</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Đã có tài khoản?</Text>
                    <Button
                        title="Đăng nhập"
                        onPress={handleLogin}
                        variant="outline"
                        size="small"
                        style={styles.loginButton}
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
        paddingTop: SPACING.xl * 2,
        paddingBottom: SPACING.xl * 2,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl + SPACING.md,
    },
    logoContainer: {
        marginBottom: SPACING.lg,
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
    registerButton: {
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
    loginButton: {
        minWidth: 140,
        borderRadius: 12,
    },
});
