import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { healthDataApi } from '../../src/api';
import { HealthData } from '../../src/types';
import { formatters } from '../../src/utils/formatters';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants/theme';

export default function HealthHistoryModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const metricType = params.type as string;

  const [data, setData] = useState<HealthData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchData();
  }, [page, sortOrder]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await healthDataApi.getPaginated({
        page,
        limit: 20,
      });
      setData(response.data);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricTitle = (): string => {
    switch (metricType) {
      case 'heart_rate':
        return 'Nhịp tim';
      case 'spo2':
        return 'SpO2';
      case 'temperature':
        return 'Nhiệt độ';
      case 'blood_pressure':
        return 'Huyết áp';
      default:
        return 'Dữ liệu sức khỏe';
    }
  };

  const getMetricValue = (item: HealthData): string => {
    switch (metricType) {
      case 'heart_rate':
        return formatters.metric(item.heart_rate, 'BPM');
      case 'spo2':
        return formatters.metric(item.spo2, '%');
      case 'temperature':
        return formatters.metric(item.body_temperature, '°C');
      case 'blood_pressure':
        return formatters.bloodPressure(
          item.blood_pressure_systolic,
          item.blood_pressure_diastolic
        );
      default:
        return 'N/A';
    }
  };

  const filteredData = data.filter((item) => {
    const value = getMetricValue(item);
    return value.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const renderItem = ({ item }: { item: HealthData }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{formatters.dateTime(item.created_at)}</Text>
      <Text style={[styles.tableCell, styles.tableCellValue]}>{getMetricValue(item)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Lịch sử {getMetricTitle()}</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <TouchableOpacity
          onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          style={styles.sortButton}
        >
          <Ionicons
            name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.sortText}>Thời gian</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Thời gian</Text>
        <Text style={styles.tableHeaderCell}>Giá trị</Text>
      </View>

      <FlatList
        data={sortedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Không có dữ liệu</Text>
          </View>
        }
      />

      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={() => setPage(page - 1)}
          disabled={page === 1}
          style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
        >
          <Ionicons name="chevron-back" size={20} color={page === 1 ? COLORS.textSecondary : COLORS.primary} />
        </TouchableOpacity>

        <Text style={styles.pageText}>
          Trang {page} / {totalPages}
        </Text>

        <TouchableOpacity
          onPress={() => setPage(page + 1)}
          disabled={page === totalPages}
          style={[styles.pageButton, page === totalPages && styles.pageButtonDisabled]}
        >
          <Ionicons name="chevron-forward" size={20} color={page === totalPages ? COLORS.textSecondary : COLORS.primary} />
        </TouchableOpacity>
      </View>
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
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.card,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  sortText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  list: {
    padding: SPACING.md,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  tableCell: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  tableCellValue: {
    fontWeight: '600',
    textAlign: 'right',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  pageButton: {
    padding: SPACING.sm,
  },
  pageButtonDisabled: {
    opacity: 0.3,
  },
  pageText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
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
