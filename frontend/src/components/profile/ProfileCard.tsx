import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { User } from '../../types';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

interface ProfileCardProps {
    user: User;
    onEditProfile: () => void;
    onSettings: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
    user,
    onEditProfile,
    onSettings,
}) => {
    return (
        <Card>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={40} color={COLORS.card} />
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.name}>{user.full_name}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <InfoItem icon="call" label="Điện thoại" value={user.phone || 'Chưa cập nhật'} />
                <InfoItem icon="calendar" label="Ngày sinh" value={user.date_of_birth || 'Chưa cập nhật'} />
            </View>

            <View style={styles.infoRow}>
                <InfoItem icon="male-female" label="Giới tính" value={user.gender || 'Chưa cập nhật'} />
                <InfoItem icon="resize" label="Chiều cao" value={user.height ? `${user.height} cm` : 'Chưa cập nhật'} />
            </View>

            <View style={styles.infoRow}>
                <InfoItem icon="fitness" label="Cân nặng" value={user.weight ? `${user.weight} kg` : 'Chưa cập nhật'} />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Chỉnh sửa"
                    onPress={onEditProfile}
                    variant="primary"
                    size="small"
                    style={styles.button}
                />
                <Button
                    title="Cài đặt"
                    onPress={onSettings}
                    variant="outline"
                    size="small"
                    style={styles.button}
                />
            </View>
        </Card>
    );
};

const InfoItem: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; value: string }> = ({
    icon,
    label,
    value,
}) => (
    <View style={styles.infoItem}>
        <Ionicons name={icon} size={18} color={COLORS.textSecondary} />
        <View style={styles.infoText}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    userInfo: {
        flex: 1,
    },
    name: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    email: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs / 2,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
    },
    infoItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        marginLeft: SPACING.xs,
        flex: 1,
    },
    infoLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
    },
    infoValue: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text,
        marginTop: SPACING.xs / 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: SPACING.md,
        gap: SPACING.sm,
    },
    button: {
        flex: 1,
    },
});