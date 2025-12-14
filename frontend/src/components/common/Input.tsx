import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TextInputProps, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    isPassword?: boolean;
    containerStyle?: any;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    isPassword = false,
    containerStyle,
    style,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = React.useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(focusAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.timing(focusAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [error ? COLORS.danger : '#e5e7eb', error ? COLORS.danger : COLORS.primary],
    });

    const shadowOpacity = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.1],
    });

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[
                    styles.label,
                    isFocused && styles.labelFocused,
                    error && styles.labelError
                ]}>
                    {label}
                </Text>
            )}
            <Animated.View
                style={[
                    styles.inputContainer,
                    error && styles.inputError,
                    {
                        borderColor,
                        shadowOpacity,
                    }
                ]}
            >
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={isPassword && !showPassword}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={22}
                            color={isFocused ? COLORS.primary : '#9ca3af'}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>
            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color={COLORS.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: '#374151',
        marginBottom: SPACING.xs,
        letterSpacing: 0.2,
    },
    labelFocused: {
        color: COLORS.primary,
    },
    labelError: {
        color: COLORS.danger,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderRadius: 14,
        paddingHorizontal: SPACING.md,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
    },
    inputError: {
        borderColor: COLORS.danger,
        backgroundColor: '#fef2f2',
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: FONT_SIZES.md,
        color: '#1f2937',
        fontWeight: '500',
    },
    eyeIcon: {
        padding: SPACING.xs,
        marginLeft: SPACING.xs,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs,
        paddingHorizontal: 4,
    },
    errorText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.danger,
        marginLeft: 4,
        fontWeight: '500',
    },
});
