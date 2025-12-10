import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ChartDataPoint } from '../../types';
import { COLORS, SPACING } from '../../constants/theme';

interface MetricChartProps {
    data: ChartDataPoint[];
    metricKey: keyof ChartDataPoint;
    color?: string;
}

export const MetricChart: React.FC<MetricChartProps> = ({
    data,
    metricKey,
    color = COLORS.primary,
}) => {
    const screenWidth = Dimensions.get('window').width - SPACING.md * 4;

    const chartData = {
        labels: data.map((item) => {
            const date = new Date(item.timestamp);
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }),
        datasets: [
            {
                data: data.map((item) => (item[metricKey] as number) || 0),
                color: () => color,
                strokeWidth: 2,
            },
        ],
    };

    if (data.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <LineChart
                data={chartData}
                width={screenWidth}
                height={180}
                chartConfig={{
                    backgroundColor: COLORS.card,
                    backgroundGradientFrom: COLORS.card,
                    backgroundGradientTo: COLORS.card,
                    decimalPlaces: 1,
                    color: () => color,
                    labelColor: () => COLORS.textSecondary,
                    style: {
                        borderRadius: 16,
                    },
                    propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                        stroke: color,
                    },
                }}
                bezier
                style={styles.chart}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: SPACING.md,
    },
    chart: {
        borderRadius: 16,
    },
});