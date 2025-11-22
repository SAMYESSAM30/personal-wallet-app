import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { useExpenses } from '../context/ExpenseContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Transaction } from '../types/expense';

const screenWidth = Dimensions.get('window').width;

type PeriodFilter = 'week' | 'month' | 'year';

export default function Reports() {
  const { transactions, formatAmount } = useExpenses();
  const { t, language } = useLanguage();
  const { colors, theme } = useTheme();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');

  // حساب البيانات للفترة المحددة
  const periodData = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    if (periodFilter === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (periodFilter === 'month') {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    return transactions.filter((t) => new Date(t.date) >= startDate);
  }, [transactions, periodFilter]);

  // بيانات الرسم البياني الخطي (المصروفات والمدخلات حسب الأيام)
  const lineChartData = useMemo(() => {
    const days = periodFilter === 'week' ? 7 : periodFilter === 'month' ? 30 : 365;
    const labels: string[] = [];
    const expensesData: number[] = [];
    const incomeData: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
      labels.push(dateStr);

      const dayExpenses = periodData
        .filter(
          (t) =>
            t.type === 'expense' &&
            new Date(t.date).toDateString() === date.toDateString()
        )
        .reduce((sum, t) => sum + t.amount, 0);
      const dayIncome = periodData
        .filter(
          (t) =>
            t.type === 'income' &&
            new Date(t.date).toDateString() === date.toDateString()
        )
        .reduce((sum, t) => sum + t.amount, 0);

      expensesData.push(dayExpenses);
      incomeData.push(dayIncome);
    }

    return {
      labels: labels.slice(-7), // عرض آخر 7 أيام فقط للوضوح
      datasets: [
        {
          data: expensesData.slice(-7),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: incomeData.slice(-7),
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [periodData, periodFilter, language]);

  // بيانات الرسم البياني الدائري (المصروفات حسب الفئات)
  const pieChartData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    periodData
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    const colorsList = [
      '#FF6B6B',
      '#4ECDC4',
      '#FFE66D',
      '#95E1D3',
      '#F38181',
      '#AA96DA',
      '#FCBAD3',
      '#C7CEEA',
    ];

    return Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], index) => ({
        name,
        value,
        color: colorsList[index % colorsList.length],
        legendFontColor: colors.text,
        legendFontSize: 12,
      }));
  }, [periodData, colors.text]);

  // بيانات الرسم البياني الشريطي (المصروفات والمدخلات الشهرية)
  const barChartData = useMemo(() => {
    const months: string[] = [];
    const expensesData: number[] = [];
    const incomeData: number[] = [];

    const monthsCount = periodFilter === 'year' ? 12 : periodFilter === 'month' ? 4 : 1;
    
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date();
      if (periodFilter === 'year') {
        date.setMonth(date.getMonth() - i);
        months.push(
          date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
            month: 'short',
          })
        );
      } else if (periodFilter === 'month') {
        date.setDate(date.getDate() - i * 7);
        months.push(
          date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
            month: 'short',
            day: 'numeric',
          })
        );
      } else {
        months.push(t('common.week'));
      }

      const monthExpenses = periodData
        .filter((t) => {
          const tDate = new Date(t.date);
          if (periodFilter === 'year') {
            return (
              tDate.getMonth() === date.getMonth() &&
              tDate.getFullYear() === date.getFullYear() &&
              t.type === 'expense'
            );
          } else if (periodFilter === 'month') {
            const weekStart = new Date(date);
            weekStart.setDate(weekStart.getDate() - 7);
            return (
              tDate >= weekStart &&
              tDate <= date &&
              t.type === 'expense'
            );
          }
          return t.type === 'expense';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const monthIncome = periodData
        .filter((t) => {
          const tDate = new Date(t.date);
          if (periodFilter === 'year') {
            return (
              tDate.getMonth() === date.getMonth() &&
              tDate.getFullYear() === date.getFullYear() &&
              t.type === 'income'
            );
          } else if (periodFilter === 'month') {
            const weekStart = new Date(date);
            weekStart.setDate(weekStart.getDate() - 7);
            return (
              tDate >= weekStart &&
              tDate <= date &&
              t.type === 'income'
            );
          }
          return t.type === 'income';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      expensesData.push(monthExpenses);
      incomeData.push(monthIncome);
    }

    return {
      labels: months,
      datasets: [
        {
          data: expensesData,
        },
        {
          data: incomeData,
        },
      ],
    };
  }, [periodData, periodFilter, language, t]);

  const totalExpenses = periodData
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = periodData
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 16,
      letterSpacing: 0.3,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.08,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: theme === 'dark' ? 1 : 0,
      borderColor: colors.border,
    },
    periodChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 2,
      marginRight: 8,
    },
    periodChipText: {
      fontSize: 14,
      fontWeight: '600',
    },
    statCard: {
      backgroundColor: theme === 'dark' ? '#1E293B' : '#F1F5F9',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    statLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 6,
      fontWeight: '500',
    },
    statValue: {
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
  });

  if (transactions.length === 0) {
    return (
      <SafeAreaView style={dynamicStyles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={[dynamicStyles.sectionTitle, { textAlign: 'center' }]}>
            {t('expenses.noTransactions')}
          </Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            {language === 'ar' ? 'أضف معاملات لرؤية التقارير والترندات' : 'Add transactions to see reports and trends'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* فلتر الفترة */}
        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.sectionTitle}>
            {language === 'ar' ? 'الفترة' : 'Period'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['week', 'month', 'year'] as PeriodFilter[]).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  dynamicStyles.periodChip,
                  {
                    backgroundColor:
                      periodFilter === period
                        ? colors.primary
                        : theme === 'dark'
                        ? '#1E293B'
                        : '#F1F5F9',
                    borderColor:
                      periodFilter === period ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setPeriodFilter(period)}
              >
                <Text
                  style={[
                    dynamicStyles.periodChipText,
                    {
                      color:
                        periodFilter === period
                          ? '#FFFFFF'
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {period === 'week'
                    ? t('common.week')
                    : period === 'month'
                    ? t('common.month')
                    : language === 'ar'
                    ? 'سنة'
                    : 'Year'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* الإحصائيات السريعة */}
        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.sectionTitle}>
            {language === 'ar' ? 'ملخص الفترة' : 'Period Summary'}
          </Text>
          <View style={styles.statsGrid}>
            <View style={dynamicStyles.statCard}>
              <Text style={dynamicStyles.statLabel}>{t('expenses.income')}</Text>
              <Text style={[dynamicStyles.statValue, { color: colors.success }]}>
                +{formatAmount(totalIncome)}
              </Text>
            </View>
            <View style={dynamicStyles.statCard}>
              <Text style={dynamicStyles.statLabel}>{t('expenses.expenses')}</Text>
              <Text style={[dynamicStyles.statValue, { color: colors.error }]}>
                -{formatAmount(totalExpenses)}
              </Text>
            </View>
            <View style={dynamicStyles.statCard}>
              <Text style={dynamicStyles.statLabel}>{t('expenses.balance')}</Text>
              <Text
                style={[
                  dynamicStyles.statValue,
                  {
                    color:
                      totalIncome - totalExpenses >= 0
                        ? colors.success
                        : colors.error,
                  },
                ]}
              >
                {totalIncome - totalExpenses >= 0 ? '+' : ''}
                {formatAmount(Math.abs(totalIncome - totalExpenses))}
              </Text>
            </View>
          </View>
        </View>

        {/* الرسم البياني الخطي */}
        {lineChartData.labels.length > 0 && (
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.sectionTitle}>
              {language === 'ar' ? 'الترند اليومي' : 'Daily Trend'}
            </Text>
            <View style={{ alignItems: 'center' }}>
              <LineChart
                data={lineChartData}
                width={screenWidth - 80}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) =>
                    theme === 'dark'
                      ? `rgba(255, 255, 255, ${opacity})`
                      : `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    theme === 'dark'
                      ? `rgba(255, 255, 255, ${opacity})`
                      : `rgba(0, 0, 0, ${opacity})`,
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          </View>
        )}

        {/* الرسم البياني الدائري */}
        {pieChartData.length > 0 && (
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.sectionTitle}>
              {language === 'ar' ? 'المصروفات حسب الفئة' : 'Expenses by Category'}
            </Text>
            <View style={{ alignItems: 'center' }}>
              <PieChart
                data={pieChartData}
                width={screenWidth - 80}
                height={220}
                chartConfig={chartConfig}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
                style={{
                  marginVertical: 8,
                }}
              />
            </View>
          </View>
        )}

        {/* الرسم البياني الشريطي */}
        {barChartData.labels.length > 0 && (
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.sectionTitle}>
              {language === 'ar' ? 'المقارنة الشهرية' : 'Monthly Comparison'}
            </Text>
            <View style={{ alignItems: 'center' }}>
              <BarChart
                data={barChartData}
                width={screenWidth - 80}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) =>
                    theme === 'dark'
                      ? `rgba(255, 255, 255, ${opacity})`
                      : `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    theme === 'dark'
                      ? `rgba(255, 255, 255, ${opacity})`
                      : `rgba(0, 0, 0, ${opacity})`,
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                yAxisLabel=""
                yAxisSuffix=""
                showValuesOnTopOfBars
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});

