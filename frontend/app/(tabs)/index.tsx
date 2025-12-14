import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ProfileCard } from '../../src/components/profile/ProfileCard';
import { HealthMetricCard } from '../../src/components/health/HealthMetricCard';
import { AlertBadge } from '../../src/components/alerts/AlertBadge';

import { useAuthStore } from '../../src/store/authStore';
import { useHealthData } from '../../src/hooks/useHealthData';
import { useAlerts } from '../../src/hooks/useAlerts';
import { useWebSocket } from '../../src/hooks/useWebSocket';
import { useDeviceStore } from '../../src/store/deviceStore';

import { COLORS, SPACING, FONT_SIZES } from '../../src/constants/theme';

export default function HomeScreen() {
    const router = useRouter();

    const { user, logout } = useAuthStore();
    const { unreadCount } = useAlerts();
    const { deviceCode } = useDeviceStore();

    const { latestData, setLatestData, fetchLatest } = useHealthData();
    const { healthData, alertData, isConnected } = useWebSocket(deviceCode);

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (healthData?.topic === 'health_data') {
            console.log('[HomeScreen] Health data:', healthData.payload);
            setLatestData(healthData.payload);
        }

        if (alertData?.topic === 'alert') {
            console.log('[HomeScreen] Alert:', alertData.payload);
            Alert.alert(
                'Cảnh báo từ thiết bị',
                alertData.payload?.message ?? 'Có cảnh báo mới'
            );
        }
    }, [healthData, alertData, setLatestData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchLatest();
        setRefreshing(false);
    }, [fetchLatest]);

    const handleLogout = async () => {
        await logout();
        router.replace('/welcome');
    };

    if (!user) return null;

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greeting}>Xin chào,</Text>
                        <Text style={styles.userName}>{user.full_name}</Text>

                        {deviceCode && (
                            <View style={styles.connectionStatus}>
                                <View
                                    style={[
                                        styles.statusDot,
                                        isConnected
                                            ? styles.statusDotConnected
                                            : styles.statusDotDisconnected,
                                    ]}
                                />
                                <Text style={styles.connectionText}>
                                    {isConnected ? 'Đang kết nối' : 'Mất kết nối'}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.headerRight}>
                        <AlertBadge
                            count={unreadCount}
                            onPress={() => router.push('/(tabs)/alerts')}
                        />
                        <TouchableOpacity
                            onPress={handleLogout}
                            style={styles.logoutButton}
                        >
                            <Ionicons
                                name="log-out-outline"
                                size={20}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* CONTENT */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                <ProfileCard
                    user={user}
                    onEditProfile={() =>
                        router.push('/modals/edit-profile')
                    }
                    onSettings={() => router.push('/(tabs)/settings')}
                />

                <View style={styles.metricsGrid}>
                    <HealthMetricCard
                        title="Nhịp tim"
                        icon="heart"
                        currentValue={latestData?.heart_rate}
                        unit="BPM"
                        metricKey="heart_rate"
                        color="#FF3B30"
                        onViewHistory={() =>
                            router.push(
                                '/modals/health-history?type=heart_rate'
                            )
                        }
                    />

                    <HealthMetricCard
                        title="SpO2"
                        icon="water"
                        currentValue={latestData?.spo2}
                        unit="%"
                        metricKey="spo2"
                        color="#007AFF"
                        onViewHistory={() =>
                            router.push(
                                '/modals/health-history?type=spo2'
                            )
                        }
                    />

                    <HealthMetricCard
                        title="Nhiệt độ"
                        icon="thermometer"
                        currentValue={latestData?.body_temperature}
                        unit="°C"
                        metricKey="body_temperature"
                        color="#FF9500"
                        onViewHistory={() =>
                            router.push(
                                '/modals/health-history?type=temperature'
                            )
                        }
                    />

                    <HealthMetricCard
                        title="Huyết áp"
                        icon="pulse"
                        currentValue={latestData?.bp_systolic}
                        unit="mmHg"
                        metricKey="bp_systolic"
                        color="#5856D6"
                        onViewHistory={() =>
                            router.push(
                                '/modals/health-history?type=blood_pressure'
                            )
                        }
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },

    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 6,
    },

    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },

    headerLeft: {
        flex: 1,
    },

    greeting: {
        fontSize: FONT_SIZES.sm,
        color: 'rgba(255,255,255,0.85)',
        marginBottom: 2,
        fontWeight: '500',
    },

    userName: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '800',
        color: '#fff',
    },

    connectionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },

    connectionText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        marginLeft: 4,
    },

    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    statusDotConnected: {
        backgroundColor: '#22c55e',
    },

    statusDotDisconnected: {
        backgroundColor: '#ef4444',
    },

    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },

    logoutButton: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    content: {
        flex: 1,
    },

    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl * 2,
    },

    metricsGrid: {
        marginTop: SPACING.md,
        gap: SPACING.lg,
    },
});
