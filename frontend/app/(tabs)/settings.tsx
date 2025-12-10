import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
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
            <View style={styles.header}>
                <Text style={styles.title}>Cài đặt</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Card>
                    <Text style={styles.sectionTitle}>Cấu hình thiết bị</Text>
                    <Input
                        label="Mã thiết bị"
                        placeholder="Nhập mã thiết bị"
                        value={newDeviceCode}
                        onChangeText={(text) => {
                            setNewDeviceCode(text);
                            setDeviceError('');
                        }}
                        error={deviceError}
                    />
                    {deviceCode && (
                        <Text style={styles.currentDevice}>Thiết bị hiện tại: {deviceCode}</Text>
                    )}
                    <Button
                        title="Gán thiết bị"
                        onPress={handleAssignDevice}
                        isLoading={isLoadingDevice}
                    />
                </Card>

                <Card>
                    <Text style={styles.sectionTitle}>Ngưỡng cảnh báo</Text>

                    <Text style={styles.subsectionTitle}>Nhịp tim (BPM)</Text>
                    <View style={styles.row}>
                        <Input
                            label="Tối thiểu"
                            placeholder="Min"
                            value={thresholdForm.heart_rate_min}
                            onChangeText={(text) => setThresholdForm({ ...thresholdForm, heart_rate_min: text })}
                            keyboardType="numeric"
                            style={styles.halfInput}
                        />
                        <Input
                            label="Tối đa"
                            placeholder="Max"
                            value={thresholdForm.heart_rate_max}
                            onChangeText={(text) => setThresholdForm({ ...thresholdForm, heart_rate_max: text })}
                            keyboardType="numeric"
                            style={styles.halfInput}
                        />
                    </View>

                    <Text style={styles.subsectionTitle}>SpO2 (%)</Text>
                    <Input
                        label="Tối thiểu"
                        placeholder="Min"
                        value={thresholdForm.spo2_min}
                        onChangeText={(text) => setThresholdForm({ ...thresholdForm, spo2_min: text })}
                        keyboardType="numeric"
                    />

                    <Text style={styles.subsectionTitle}>Nhiệt độ cơ thể (°C)</Text>
                    <View style={styles.row}>
                        <Input
                            label="Tối thiểu"
                            placeholder="Min"
                            value={thresholdForm.body_temp_min}
                            onChangeText={(text) => setThresholdForm({ ...thresholdForm, body_temp_min: text })}
                            keyboardType="numeric"
                            style={styles.halfInput}
                        />
                        <Input
                            label="Tối đa"
                            placeholder="Max"
                            value={thresholdForm.body_temp_max}
                            onChangeText={(text) => setThresholdForm({ ...thresholdForm, body_temp_max: text })}
                            keyboardType="numeric"
                            style={styles.halfInput}
                        />
                    </View>

                    <Text style={styles.subsectionTitle}>Huyết áp tâm thu (mmHg)</Text>
                    <View style={styles.row}>
                        <Input
                            label="Tối thiểu"
                            placeholder="Min"
                            value={thresholdForm.bp_systolic_min}
                            onChangeText={(text) => setThresholdForm({ ...thresholdForm, bp_systolic_min: text })}
                            keyboardType="numeric"
                            style={styles.halfInput}
                        />
                        <Input
                            label="Tối đa"
                            placeholder="Max"
                            value={thresholdForm.bp_systolic_max}
                            onChangeText={(text) => setThresholdForm({ ...thresholdForm, bp_systolic_max: text })}
                            keyboardType="numeric"
                            style={styles.halfInput}
                        />
                    </View>

                    <Text style={styles.subsectionTitle}>Huyết áp tâm trương (mmHg)</Text>
                    <View style={styles.row}>
                        <Input
                            label="Tối thiểu"
                            placeholder="Min"
                            value={thresholdForm.bp_diastolic_min}
                            onChangeText={(text) => setThresholdForm({ ...thresholdForm, bp_diastolic_min: text })}
                            keyboardType="numeric"
                            style={styles.halfInput}
                        />
                        <Input
                            label="Tối đa"
                            placeholder="Max"
                            value={thresholdForm.bp_diastolic_max}
                            onChangeText={(text) => setThresholdForm({ ...thresholdForm, bp_diastolic_max: text })}
                            keyboardType="numeric"
                            style={styles.halfInput}
                        />
                    </View>

                    <Button
                        title="Cập nhật ngưỡng"
                        onPress={handleUpdateThreshold}
                        isLoading={isLoadingThreshold}
                    />
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
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
    content: {
        padding: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    subsectionTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: SPACING.md,
        marginBottom: SPACING.xs,
    },
    currentDevice: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    halfInput: {
        flex: 1,
    },
});
