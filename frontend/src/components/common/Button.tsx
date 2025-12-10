import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'small' | 'medium' | 'large';
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    disabled = false,
    style,
}) => {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            ...styles.button,
            ...styles[`${size}Button`],
            ...styles[`${variant}Button`],
        };

        if (disabled || isLoading) {
            return { ...baseStyle, opacity: 0.6 };
        }

        return baseStyle;
    };

    const getTextStyle = (): TextStyle => ({
        ...styles.text,
        ...styles[`${size}Text`],
        ...styles[`${variant}Text`],
    });

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.7}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.card} />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BORDER_RADIUS.md,
    },
    smallButton: {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
    },
    mediumButton: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
    },
    largeButton: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    secondaryButton: {
        backgroundColor: COLORS.secondary,
    },
    dangerButton: {
        backgroundColor: COLORS.danger,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    text: {
        fontWeight: '600',
    },
    smallText: {
        fontSize: FONT_SIZES.sm,
    },
    mediumText: {
        fontSize: FONT_SIZES.md,
    },
    largeText: {
        fontSize: FONT_SIZES.lg,
    },
    primaryText: {
        color: COLORS.card,
    },
    secondaryText: {
        color: COLORS.card,
    },
    dangerText: {
        color: COLORS.card,
    },
    outlineText: {
        color: COLORS.primary,
    },
});
