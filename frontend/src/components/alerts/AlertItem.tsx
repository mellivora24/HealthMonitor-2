import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from '../../types';
import { formatters } from '../../utils/formatters';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

interface AlertItemProps {
    alert: Alert;
    onMarkAsRead: () => void;
    onDelete: () => void;
}

export const AlertItem: React.FC<AlertItemProps> = ({
    alert,
    onMarkAsRead,
    onDelete,
}) => {
    const getAlertIcon = (): keyof typeof Ionicons.glyphMap => {
        switch (alert.alert_type) {
            case 'heart_rate':
                return 'heart';
            case 'spo2':
                return 'water';
            case 'temperature':
                return 'thermometer';
            case 'blood_pressure':
                return 'pulse';
            case 'fall_detection':
                return 'warning';
            default:
                return 'notifications';
        }
    };

    const getAlertColor = (): string => {
        if (alert.alert_type === 'fall_detection') return COLORS.danger;
        if (alert.alert_type === 'device_offline') return COLORS.warning;
        return COLORS.primary;
    };

    return (
        <View style={[styles.container, !alert.is_read && styles.unread]}>
            <View style={[styles.iconContainer, { backgroundColor: getAlertColor() + '20' }]}>
                <Ionicons name={getAlertIcon()} size={24} color={getAlertColor()} />
            </View>

            <View style={styles.content}>
                <Text style={styles.message}>{alert.message}</Text>
                <Text style={styles.time}>{formatters.dateTime(alert.created_at)}</Text>
            </View>

            <View style={styles.actions}>
                {!alert.is_read && (
                    <TouchableOpacity onPress={onMarkAsRead} style={styles.actionButton}>
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                    <Ionicons name="trash" size={24} color={COLORS.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: SPACING.md,
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        alignItems: 'center',
    },
    unread: {
        backgroundColor: COLORS.primary + '10',
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    content: {
        flex: 1,
    },
    message: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    time: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
    },
    actions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: SPACING.sm,
    },
});