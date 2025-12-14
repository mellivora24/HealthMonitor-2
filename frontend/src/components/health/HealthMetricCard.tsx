import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { RealtimeMetric } from './RealtimeMetric';
import { MetricChart } from './MetricChart';
import { Button } from '../common/Button';
import { ChartDataPoint } from '../../types';
import { healthDataApi } from '../../api';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

interface HealthMetricCardProps {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    currentValue: number | undefined;
    unit: string;
    metricKey: keyof ChartDataPoint;
    color: string;
    onViewHistory: () => void;
}

export const HealthMetricCard: React.FC<HealthMetricCardProps> = ({
    title,
    icon,
    currentValue,
    unit,
    metricKey,
    color,
    onViewHistory,
}) => {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        setIsLoading(true);
        try {
            const endDate = new Date(); // bây giờ
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 7); // 7 ngày trước

            const data = await healthDataApi.getChartData({
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
            });

            // check dữ liệu trước khi set state
            setChartData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setChartData([]); // fallback
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Card>
            <Text style={styles.title}>{title}</Text>

            <RealtimeMetric
                icon={icon}
                label="Giá trị hiện tại"
                value={currentValue?.toFixed(1) || '--'}
                unit={unit}
                color={color}
            />

            <MetricChart data={chartData} metricKey={metricKey} color={color} />

            <Button
                title="Xem lịch sử"
                onPress={onViewHistory}
                variant="outline"
                size="small"
            />
        </Card>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
});