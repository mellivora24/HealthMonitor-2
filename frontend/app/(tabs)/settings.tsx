import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { deviceApi, thresholdApi } from '../../src/api';
import { useDeviceStore } from '../../src/store/deviceStore';
import { HealthThreshold } from '../../src/types';
import { validators } from '../../src/utils/validation';
import { COLORS, SPACING, FONT_SIZES } from '../../src/constants/theme';

export default function SettingsScreen() {
    const { deviceCode, setDeviceCode, loadDeviceCode } = useDeviceStore();
    const [isLoadingDevice, setIsLoadingDevice] = useState(false);
    const [isLoadingThreshold, setIsLoadingThreshold] = useState(false);

    const [newDeviceCode, setNewDeviceCode] = useState('');
    const [deviceError, setDeviceError] = useState('');

    const [threshold, setThreshold] = useState<HealthThreshold | null>(null);
    const [thresholdForm, setThresholdForm] = useState({
        heart_rate_min: '',
        heart_rate_max: '',
        spo2_min: '',
        body_temp_min: '',
        body_temp_max: '',
        bp_systolic_min: '',
        bp_systolic_max: '',
        bp_diastolic_min: '',
        bp_diastolic_max: '',
    });

    useEffect(() => {
        loadDeviceCode();
        loadThreshold();
    }, []);

    useEffect(() => {
        if (deviceCode) {
            setNewDeviceCode(deviceCode);
        }
    }, [deviceCode]);

    useEffect(() => {
        if (threshold) {
            setThresholdForm({
                heart_rate_min: threshold.heart_rate_min.toString(),
                heart_rate_max: threshold.heart_rate_max.toString(),
                spo2_min: threshold.spo2_min.toString(),
                body_temp_min: threshold.body_temp_min.toString(),
                body_temp_max: threshold.body_temp_max.toString(),
                bp_systolic_min: threshold.bp_systolic_min.toString(),
                bp_systolic_max: threshold.bp_systolic_max.toString(),
                bp_diastolic_min: threshold.bp_diastolic_min.toString(),
                bp_diastolic_max: threshold.bp_diastolic_max.toString(),
            });
        }
    }, [threshold]);

    const loadThreshold = async () => {
        try {
            const data = await thresholdApi.getThreshold();
            setThreshold(data);
        } catch (error) {
            console.error('Error loading threshold:', error);
        }
    };

    const handleAssignDevice = async () => {
        const error = validators.deviceCode(newDeviceCode);
        if (error) {
            setDeviceError(error);
            return;
        }

        setIsLoadingDevice(true);
        try {
            await deviceApi.assignDevice({ device_code: newDeviceCode });
            await setDeviceCode(newDeviceCode);
            Alert.alert('Thành công', 'Đã gán thiết bị thành công');
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể gán thiết bị');
        } finally {
            setIsLoadingDevice(false);
        }
    };

    const handleUpdateThreshold = async () => {
        setIsLoadingThreshold(true);
        try {
            const data = {
                heart_rate_min: parseFloat(thresholdForm.heart_rate_min),
                heart_rate_max: parseFloat(thresholdForm.heart_rate_max),
                spo2_min: parseFloat(thresholdForm.spo2_min),
                body_temp_min: parseFloat(thresholdForm.body_temp_min),
                body_temp_max: parseFloat(thresholdForm.body_temp_max),
                bp_systolic_min: parseFloat(thresholdForm.bp_systolic_min),
                bp_systolic_max: parseFloat(thresholdForm.bp_systolic_max),
                bp_diastolic_min: parseFloat(thresholdForm.bp_diastolic_min),
                bp_diastolic_max: parseFloat(thresholdForm.bp_diastolic_max),
            };

            await thresholdApi.updateThreshold(data);
            Alert.alert('Thành công', 'Đã cập nhật ngưỡng cảnh báo');
            loadThreshold();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật ngưỡng');
        } finally {
            setIsLoadingThreshold(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.title}>Cài đặt</Text>
            </LinearGradient>

            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Device Configuration Card */}
                <View style={styles.card}>
                    <View style={styles.cardIconContainer}>
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.primary]}
                            style={styles.iconGradient}
                        >
                            <Text style={styles.cardIcon}>📱</Text>
                        </LinearGradient>
                    </View>
                    
                    <Text style={styles.sectionTitle}>Cấu hình thiết bị</Text>
                    <Text style={styles.sectionDescription}>
                        Kết nối và quản lý thiết bị theo dõi sức khỏe của bạn
                    </Text>
                    
                    {deviceCode && (
                        <View style={styles.currentDeviceContainer}>
                            <View style={styles.deviceBadge}>
                                <Text style={styles.deviceBadgeIcon}>✓</Text>
                            </View>
                            <View style={styles.deviceInfo}>
                                <Text style={styles.currentDeviceLabel}>Thiết bị đang kết nối</Text>
                                <Text style={styles.currentDevice}>{deviceCode}</Text>
                            </View>
                        </View>
                    )}
                    
                    <Input
                        label="Mã thiết bị"
                        placeholder="Nhập mã thiết bị của bạn"
                        value={newDeviceCode}
                        onChangeText={(text) => {
                            setNewDeviceCode(text);
                            setDeviceError('');
                        }}
                        error={deviceError}
                    />
                    
                    <Button
                        title={deviceCode ? "Cập nhật thiết bị" : "Gán thiết bị"}
                        onPress={handleAssignDevice}
                        isLoading={isLoadingDevice}
                        style={styles.button}
                    />
                </View>

                {/* Health Thresholds Card */}
                <View style={styles.card}>
                    <View style={styles.cardIconContainer}>
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.primary]}
                            style={styles.iconGradient}
                        >
                            <Text style={styles.cardIcon}>🔔</Text>
                        </LinearGradient>
                    </View>
                    
                    <Text style={styles.sectionTitle}>Ngưỡng cảnh báo</Text>
                    <Text style={styles.sectionDescription}>
                        Tùy chỉnh các giá trị cảnh báo sức khỏe phù hợp với bạn
                    </Text>

                    {/* Heart Rate */}
                    <View style={styles.thresholdSection}>
                        <View style={styles.thresholdHeader}>
                            <View style={styles.thresholdIconBox}>
                                <Text style={styles.thresholdIcon}>💓</Text>
                            </View>
                            <View>
                                <Text style={styles.subsectionTitle}>Nhịp tim</Text>
                                <Text style={styles.subsectionUnit}>Đơn vị: BPM</Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <Input
                                label="Tối thiểu"
                                placeholder="60"
                                value={thresholdForm.heart_rate_min}
                                onChangeText={(text) => setThresholdForm({ ...thresholdForm, heart_rate_min: text })}
                                keyboardType="numeric"
                                containerStyle={styles.halfInput}
                            />
                            <Input
                                label="Tối đa"
                                placeholder="100"
                                value={thresholdForm.heart_rate_max}
                                onChangeText={(text) => setThresholdForm({ ...thresholdForm, heart_rate_max: text })}
                                keyboardType="numeric"
                                containerStyle={styles.halfInput}
                            />
                        </View>
                    </View>

                    {/* SpO2 */}
                    <View style={styles.thresholdSection}>
                        <View style={styles.thresholdHeader}>
                            <View style={styles.thresholdIconBox}>
                                <Text style={styles.thresholdIcon}>💧</Text>
                            </View>
                            <View>
                                <Text style={styles.subsectionTitle}>Nồng độ oxy máu</Text>
                                <Text style={styles.subsectionUnit}>Đơn vị: %</Text>
                            </View>
                        </View>
                        <Input
                            label="Tối thiểu"
                            placeholder="95"
                            value={thresholdForm.spo2_min}
                            onChangeText={(text) => setThresholdForm({ ...thresholdForm, spo2_min: text })}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Body Temperature */}
                    <View style={styles.thresholdSection}>
                        <View style={styles.thresholdHeader}>
                            <View style={styles.thresholdIconBox}>
                                <Text style={styles.thresholdIcon}>🌡️</Text>
                            </View>
                            <View>
                                <Text style={styles.subsectionTitle}>Nhiệt độ cơ thể</Text>
                                <Text style={styles.subsectionUnit}>Đơn vị: °C</Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <Input
                                label="Tối thiểu"
                                placeholder="36.0"
                                value={thresholdForm.body_temp_min}
                                onChangeText={(text) => setThresholdForm({ ...thresholdForm, body_temp_min: text })}
                                keyboardType="numeric"
                                containerStyle={styles.halfInput}
                            />
                            <Input
                                label="Tối đa"
                                placeholder="37.5"
                                value={thresholdForm.body_temp_max}
                                onChangeText={(text) => setThresholdForm({ ...thresholdForm, body_temp_max: text })}
                                keyboardType="numeric"
                                containerStyle={styles.halfInput}
                            />
                        </View>
                    </View>

                    {/* Systolic Blood Pressure */}
                    <View style={styles.thresholdSection}>
                        <View style={styles.thresholdHeader}>
                            <View style={styles.thresholdIconBox}>
                                <Text style={styles.thresholdIcon}>📊</Text>
                            </View>
                            <View>
                                <Text style={styles.subsectionTitle}>Huyết áp tâm thu</Text>
                                <Text style={styles.subsectionUnit}>Đơn vị: mmHg</Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <Input
                                label="Tối thiểu"
                                placeholder="90"
                                value={thresholdForm.bp_systolic_min}
                                onChangeText={(text) => setThresholdForm({ ...thresholdForm, bp_systolic_min: text })}
                                keyboardType="numeric"
                                containerStyle={styles.halfInput}
                            />
                            <Input
                                label="Tối đa"
                                placeholder="140"
                                value={thresholdForm.bp_systolic_max}
                                onChangeText={(text) => setThresholdForm({ ...thresholdForm, bp_systolic_max: text })}
                                keyboardType="numeric"
                                containerStyle={styles.halfInput}
                            />
                        </View>
                    </View>

                    {/* Diastolic Blood Pressure */}
                    <View style={styles.thresholdSection}>
                        <View style={styles.thresholdHeader}>
                            <View style={styles.thresholdIconBox}>
                                <Text style={styles.thresholdIcon}>📉</Text>
                            </View>
                            <View>
                                <Text style={styles.subsectionTitle}>Huyết áp tâm trương</Text>
                                <Text style={styles.subsectionUnit}>Đơn vị: mmHg</Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <Input
                                label="Tối thiểu"
                                placeholder="60"
                                value={thresholdForm.bp_diastolic_min}
                                onChangeText={(text) => setThresholdForm({ ...thresholdForm, bp_diastolic_min: text })}
                                keyboardType="numeric"
                                containerStyle={styles.halfInput}
                            />
                            <Input
                                label="Tối đa"
                                placeholder="90"
                                value={thresholdForm.bp_diastolic_max}
                                onChangeText={(text) => setThresholdForm({ ...thresholdForm, bp_diastolic_max: text })}
                                keyboardType="numeric"
                                containerStyle={styles.halfInput}
                            />
                        </View>
                    </View>

                    <Button
                        title="💾 Lưu thay đổi"
                        onPress={handleUpdateThreshold}
                        isLoading={isLoadingThreshold}
                        style={styles.button}
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
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    content: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl * 2,
    },
    card: {
        marginBottom: SPACING.lg,
        padding: SPACING.xl,
        borderRadius: 24,
        backgroundColor: '#fff',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    cardIconContainer: {
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    iconGradient: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    cardIcon: {
        fontSize: 32,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    sectionDescription: {
        fontSize: FONT_SIZES.sm,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: SPACING.lg,
        lineHeight: 20,
    },
    currentDeviceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f9ff',
        padding: SPACING.lg,
        borderRadius: 16,
        marginBottom: SPACING.lg,
        borderWidth: 2,
        borderColor: '#bfdbfe',
    },
    deviceBadge: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    deviceBadgeIcon: {
        fontSize: 24,
        color: '#fff',
    },
    deviceInfo: {
        flex: 1,
    },
    currentDeviceLabel: {
        fontSize: FONT_SIZES.xs,
        color: '#64748b',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    currentDevice: {
        fontSize: FONT_SIZES.lg,
        color: COLORS.primary,
        fontWeight: '700',
    },
    thresholdSection: {
        marginTop: SPACING.xl,
        paddingTop: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    thresholdHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    thresholdIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#fef3c7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    thresholdIcon: {
        fontSize: 24,
    },
    subsectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    subsectionUnit: {
        fontSize: FONT_SIZES.xs,
        color: '#9ca3af',
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    halfInput: {
        flex: 1,
    },
    button: {
        marginTop: SPACING.xl,
        borderRadius: 16,
        paddingVertical: SPACING.md + 2,
    },
});
