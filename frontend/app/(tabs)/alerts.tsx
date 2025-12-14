import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertItem } from '../../src/components/alerts/AlertItem';
import { Button } from '../../src/components/common/Button';
import { useAlerts } from '../../src/hooks/useAlerts';
import { Alert as AlertType } from '../../src/types';
import { COLORS, SPACING, FONT_SIZES } from '../../src/constants/theme';

export default function AlertsScreen() {
    const { alerts, markAlertsAsRead, deleteAlert, deleteMultipleAlerts } = useAlerts();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleMarkAllAsRead = async () => {
        const unreadIds = alerts.filter((a) => !a.is_read).map((a) => a.id);
        if (!unreadIds.length) {
            Alert.alert('Thông báo', 'Không có thông báo chưa đọc');
            return;
        }
        await markAlertsAsRead(unreadIds);
    };

    const handleDeleteSelected = async () => {
        if (!selectedIds.length) {
            Alert.alert('Thông báo', 'Vui lòng chọn thông báo');
            return;
        }

        Alert.alert(
            'Xác nhận',
            `Xóa ${selectedIds.length} thông báo đã chọn?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteMultipleAlerts(selectedIds);
                        setSelectedIds([]);
                        setSelectionMode(false);
                    },
                },
            ]
        );
    };

    const handleMarkAsRead = async (alert: AlertType) => {
        if (!alert.is_read) await markAlertsAsRead([alert.id]);
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Xác nhận', 'Xóa thông báo này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => await deleteAlert(id),
            },
        ]);
    };

    const renderItem = ({ item }: { item: AlertType }) => {
        if (selectionMode) {
            return (
                <TouchableOpacity onPress={() => toggleSelection(item.id)}>
                    <View
                        style={[
                            styles.selectRow,
                            selectedIds.includes(item.id) && styles.selectRowActive,
                        ]}
                    >
                        <View style={styles.checkbox}>
                            <Ionicons
                                name={selectedIds.includes(item.id) ? 'checkmark' : ''}
                                size={18}
                                color="#fff"
                            />
                        </View>

                        <View style={styles.alertWrapper}>
                            <AlertItem
                                alert={item}
                                onMarkAsRead={() => handleMarkAsRead(item)}
                                onDelete={() => handleDelete(item.id)}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <AlertItem
                alert={item}
                onMarkAsRead={() => handleMarkAsRead(item)}
                onDelete={() => handleDelete(item.id)}
            />
        );
    };

    return (
        <View style={styles.container}>
            {/* ===== HEADER ===== */}
            <LinearGradient
                colors={[COLORS.primary, COLORS.primary]}
                style={styles.header}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Thông báo</Text>

                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleMarkAllAsRead}
                        >
                            <Ionicons name="checkmark-done" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* ===== SELECTION BAR ===== */}
            {selectionMode && (
                <View style={styles.selectionBar}>
                    <Text style={styles.selectionText}>
                        Đã chọn {selectedIds.length}/{alerts.length}
                    </Text>
                    <Button
                        title="Xóa đã chọn"
                        size="small"
                        variant="danger"
                        onPress={handleDeleteSelected}
                    />
                </View>
            )}

            {/* ===== LIST ===== */}
            <FlatList
                data={alerts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <View style={styles.emptyIcon}>
                            <Ionicons
                                name="notifications-off-outline"
                                size={64}
                                color={COLORS.primary}
                            />
                        </View>
                        <Text style={styles.emptyTitle}>Không có thông báo</Text>
                        <Text style={styles.emptyDesc}>
                            Thông báo mới sẽ hiển thị tại đây
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },

    /* HEADER */
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: 50,
        paddingBottom: SPACING.lg,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 6,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '800',
        color: '#fff',
    },
    headerActions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* SELECTION */
    selectionBar: {
        margin: SPACING.lg,
        padding: SPACING.md,
        borderRadius: 16,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    selectionText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.primary,
    },

    /* LIST */
    list: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl * 2,
    },

    selectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        padding: SPACING.sm,
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
    selectRowActive: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    alertWrapper: {
        flex: 1,
    },

    /* EMPTY */
    empty: {
        alignItems: 'center',
        paddingVertical: SPACING.xl * 3,
    },
    emptyIcon: {
        width: 120,
        height: 120,
        borderRadius: 30,
        backgroundColor: '#e0f2fe',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    emptyTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 6,
    },
    emptyDesc: {
        fontSize: FONT_SIZES.sm,
        color: '#6b7280',
    },
});

