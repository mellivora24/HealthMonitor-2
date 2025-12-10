import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

interface AlertBadgeProps {
    count: number;
    onPress: () => void;
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({ count, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <Ionicons
                name={count > 0 ? 'notifications' : 'notifications-outline'}
                size={24}
                color={COLORS.text}
            />
            {count > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        padding: SPACING.xs,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.danger,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xs / 2,
    },
    badgeText: {
        color: COLORS.card,
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
    },
});