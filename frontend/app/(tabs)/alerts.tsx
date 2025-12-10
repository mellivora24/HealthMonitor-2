import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlertItem } from '../../src/components/alerts/AlertItem';
import { Button } from '../../src/components/common/Button';
import { useAlerts } from '../../src/hooks/useAlerts';
import { Alert as AlertType } from '../../src/types';
import { COLORS, SPACING, FONT_SIZES } from '../../src/constants/theme';

export default function AlertsScreen() {
    const { alerts, isLoading, markAlertsAsRead, deleteAlert, deleteMultipleAlerts } = useAlerts();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleMarkAllAsRead = async () => {
        const unreadIds = alerts.filter((a) => !a.is_read).map((a) => a.id);
        if (unreadIds.length === 0) {
            Alert.alert('Thông báo', 'Không có thông báo chưa đọc');
            return;
        }

        try {
            await markAlertsAsRead(unreadIds);
            Alert.alert('Thành công', 'Đã đánh dấu tất cả là đã đọc');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể đánh dấu đã đọc');
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn thông báo cần xóa');
            return;
        }

        Alert.alert(
            'Xác nhận',
            `Bạn có chắc muốn xóa ${selectedIds.length} thông báo?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMultipleAlerts(selectedIds);
                            setSelectedIds([]);
                            setSelectionMode(false);
                            Alert.alert('Thành công', 'Đã xóa thông báo');
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa thông báo');
                        }
                    },
                },
            ]
        );
    };

    const handleMarkAsRead = async (alert: AlertType) => {
        if (alert.is_read) return;
        try {
            await markAlertsAsRead([alert.id]);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể đánh dấu đã đọc');
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa thông báo này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteAlert(id);
                        Alert.alert('Thành công', 'Đã xóa thông báo');
                    } catch (error) {
                        Alert.alert('Lỗi', 'Không thể xóa thông báo');
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }: { item: AlertType }) => {
        if (selectionMode) {
            return (
                <TouchableOpacity onPress={() => toggleSelection(item.id)}>
                    <View style={[styles.alertContainer, selectedIds.includes(item.id) && styles.selected]}>
                        <Ionicons
                            name={selectedIds.includes(item.id) ? 'checkbox' : 'square-outline'}
                            size={24}
                            color={COLORS.primary}
                        />
                        <View style={styles.alertContent}>
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
            <View style={styles.header}>
                <Text style={styles.title}>Thông báo</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.headerButton}>
                        <Ionicons name="checkmark-done" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setSelectionMode(!selectionMode);
                            setSelectedIds([]);
                        }}
                        style={styles.headerButton}
                    >
                        <Ionicons
                            name={selectionMode ? 'close' : 'checkmark-circle-outline'}
                            size={24}
                            color={COLORS.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {selectionMode && (
                <View style={styles.selectionBar}>
                    <Text style={styles.selectionText}>
                        Đã chọn: {selectedIds.length}/{alerts.length}
                    </Text>
                    <Button
                        title="Xóa đã chọn"
                        onPress={handleDeleteSelected}
                        variant="danger"
                        size="small"
                    />
                </View>
            )}

            <FlatList
                data={alerts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off" size={64} color={COLORS.textSecondary} />
                        <Text style={styles.emptyText}>Không có thông báo</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerButton: {
        marginLeft: SPACING.md,
    },
    selectionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.primary + '20',
    },
    selectionText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
        fontWeight: '600',
    },
    list: {
        padding: SPACING.md,
    },
    alertContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    selected: {
        backgroundColor: COLORS.primary + '10',
        borderRadius: 8,
        padding: SPACING.xs,
    },
    alertContent: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
});