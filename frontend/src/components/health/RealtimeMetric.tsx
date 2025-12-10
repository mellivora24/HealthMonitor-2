import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

interface RealtimeMetricProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    unit: string;
    color?: string;
}

export const RealtimeMetric: React.FC<RealtimeMetricProps> = ({
    icon,
    label,
    value,
    unit,
    color = COLORS.primary,
}) => {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={32} color={color} />
            <Text style={styles.label}>{label}</Text>
            <View style={styles.valueContainer}>
                <Text style={[styles.value, { color }]}>{value}</Text>
                <Text style={styles.unit}>{unit}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: SPACING.md,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    value: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
    },
    unit: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
});