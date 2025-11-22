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
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpenses } from '../context/ExpenseContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Transaction } from '../types/expense';
import { analyticsService } from '../services/analyticsService';
import { mentoringService } from '../services/mentoringService';
import { ChartErrorBoundary } from '../components/ChartErrorBoundary';

const screenWidth = Dimensions.get('window').width;

type PeriodFilter = 'week' | 'month' | 'year';

export default function Reports() {
  const { transactions, formatAmount, totalIncome, totalExpenses } = useExpenses();
  const { t, language } = useLanguage();
  const { colors, theme } = useTheme();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [showAnalytics, setShowAnalytics] = useState(true);

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

  const periodTotalExpenses = periodData
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodTotalIncome = periodData
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Analytics and Mentoring
  const financialHealth = useMemo(() => {
    return analyticsService.calculateFinancialHealth(transactions, totalIncome, totalExpenses);
  }, [transactions, totalIncome, totalExpenses]);

  const categoryInsights = useMemo(() => {
    return analyticsService.getCategoryInsights(transactions, 30);
  }, [transactions]);

  const financialTips = useMemo(() => {
    return mentoringService.generateTips(
      transactions,
      totalIncome,
      totalExpenses,
      financialHealth,
      categoryInsights
    );
  }, [transactions, totalIncome, totalExpenses, financialHealth, categoryInsights]);

  const budgetRecommendations = useMemo(() => {
    return mentoringService.generateBudgetRecommendations(transactions, totalIncome, categoryInsights);
  }, [transactions, totalIncome, categoryInsights]);

  const motivationalMessage = useMemo(() => {
    return mentoringService.getMotivationalMessage(financialHealth, language);
  }, [financialHealth, language]);

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
                +{formatAmount(periodTotalIncome)}
              </Text>
            </View>
            <View style={dynamicStyles.statCard}>
              <Text style={dynamicStyles.statLabel}>{t('expenses.expenses')}</Text>
              <Text style={[dynamicStyles.statValue, { color: colors.error }]}>
                -{formatAmount(periodTotalExpenses)}
              </Text>
            </View>
            <View style={dynamicStyles.statCard}>
              <Text style={dynamicStyles.statLabel}>{t('expenses.balance')}</Text>
              <Text
                style={[
                  dynamicStyles.statValue,
                  {
                    color:
                      periodTotalIncome - periodTotalExpenses >= 0
                        ? colors.success
                        : colors.error,
                  },
                ]}
              >
                {periodTotalIncome - periodTotalExpenses >= 0 ? '+' : ''}
                {formatAmount(Math.abs(periodTotalIncome - periodTotalExpenses))}
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
            <ChartErrorBoundary>
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
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  withDots={true}
                  withShadow={false}
                />
              </View>
            </ChartErrorBoundary>
          </View>
        )}

        {/* الرسم البياني الدائري */}
        {pieChartData.length > 0 && (
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.sectionTitle}>
              {language === 'ar' ? 'المصروفات حسب الفئة' : 'Expenses by Category'}
            </Text>
            <ChartErrorBoundary>
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
            </ChartErrorBoundary>
          </View>
        )}

        {/* الرسم البياني الشريطي */}
        {barChartData.labels.length > 0 && (
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.sectionTitle}>
              {language === 'ar' ? 'المقارنة الشهرية' : 'Monthly Comparison'}
            </Text>
            <ChartErrorBoundary>
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
                  showValuesOnTopOfBars={true}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                />
              </View>
            </ChartErrorBoundary>
          </View>
        )}

        {/* Analytics and Mentoring Section */}
        {showAnalytics && (
          <>
            {/* Financial Health Score */}
            <View style={dynamicStyles.card}>
              <View style={styles.analyticsHeader}>
                <Text style={dynamicStyles.sectionTitle}>
                  {language === 'ar' ? 'صحة مالية' : 'Financial Health'}
                </Text>
                <TouchableOpacity onPress={() => setShowAnalytics(!showAnalytics)}>
                  <Icon name="chevron-up" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.healthScoreContainer}>
                <View style={[styles.scoreCircle, { borderColor: colors.primary }]}>
                  <Text style={[styles.scoreText, { color: colors.primary }]}>
                    {financialHealth.score}
                  </Text>
                  <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                    {language === 'ar' ? 'نقاط' : 'Score'}
                  </Text>
                </View>
                <View style={styles.healthInfo}>
                  <Text style={[styles.healthStatus, { color: colors.text }]}>
                    {language === 'ar' 
                      ? financialHealth.status === 'excellent' ? 'ممتاز' 
                      : financialHealth.status === 'good' ? 'جيد'
                      : financialHealth.status === 'fair' ? 'مقبول'
                      : 'يحتاج تحسين'
                      : financialHealth.status.charAt(0).toUpperCase() + financialHealth.status.slice(1)}
                  </Text>
                  <Text style={[styles.motivationalText, { color: colors.textSecondary }]}>
                    {motivationalMessage}
                  </Text>
                </View>
              </View>
            </View>

            {/* Financial Tips */}
            {financialTips.length > 0 && (
              <View style={dynamicStyles.card}>
                <Text style={dynamicStyles.sectionTitle}>
                  {language === 'ar' ? 'نصائح مالية' : 'Financial Tips'}
                </Text>
                {financialTips.map((tip) => (
                  <View key={tip.id} style={[styles.tipCard, { backgroundColor: theme === 'dark' ? '#1E293B' : '#F1F5F9' }]}>
                    <View style={styles.tipHeader}>
                      <Icon 
                        name={tip.priority === 'high' ? 'alert-circle' : tip.priority === 'medium' ? 'information-circle' : 'checkmark-circle'} 
                        size={20} 
                        color={tip.priority === 'high' ? colors.error : tip.priority === 'medium' ? colors.primary : colors.success} 
                      />
                      <Text style={[styles.tipTitle, { color: colors.text }]}>
                        {tip.title}
                      </Text>
                    </View>
                    <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
                      {tip.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Category Insights */}
            {categoryInsights.length > 0 && (
              <View style={dynamicStyles.card}>
                <Text style={dynamicStyles.sectionTitle}>
                  {language === 'ar' ? 'تحليل الفئات' : 'Category Analysis'}
                </Text>
                {categoryInsights.slice(0, 5).map((insight) => (
                  <View key={insight.category} style={styles.insightRow}>
                    <View style={styles.insightInfo}>
                      <Text style={[styles.insightCategory, { color: colors.text }]}>
                        {insight.category}
                      </Text>
                      <Text style={[styles.insightPercentage, { color: colors.textSecondary }]}>
                        {Math.round(insight.percentage)}% • {insight.transactionCount} {language === 'ar' ? 'معاملة' : 'transactions'}
                      </Text>
                    </View>
                    <View style={styles.insightAmount}>
                      <Text style={[styles.insightAmountText, { color: colors.text }]}>
                        {formatAmount(insight.totalAmount)}
                      </Text>
                      {insight.trend === 'increasing' && (
                        <Icon name="trending-up" size={16} color={colors.error} />
                      )}
                      {insight.trend === 'decreasing' && (
                        <Icon name="trending-down" size={16} color={colors.success} />
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Budget Recommendations */}
            {budgetRecommendations.length > 0 && (
              <View style={dynamicStyles.card}>
                <Text style={dynamicStyles.sectionTitle}>
                  {language === 'ar' ? 'توصيات الميزانية' : 'Budget Recommendations'}
                </Text>
                {budgetRecommendations.map((rec) => (
                  <View key={rec.category} style={styles.recommendationCard}>
                    <Text style={[styles.recommendationCategory, { color: colors.text }]}>
                      {rec.category}
                    </Text>
                    <View style={styles.recommendationAmounts}>
                      <View>
                        <Text style={[styles.recommendationLabel, { color: colors.textSecondary }]}>
                          {language === 'ar' ? 'الإنفاق الحالي' : 'Current'}
                        </Text>
                        <Text style={[styles.recommendationValue, { color: colors.error }]}>
                          {formatAmount(rec.currentSpending)}
                        </Text>
                      </View>
                      <Icon name="arrow-forward" size={20} color={colors.textSecondary} />
                      <View>
                        <Text style={[styles.recommendationLabel, { color: colors.textSecondary }]}>
                          {language === 'ar' ? 'الموصى به' : 'Recommended'}
                        </Text>
                        <Text style={[styles.recommendationValue, { color: colors.success }]}>
                          {formatAmount(rec.recommendedBudget)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.recommendationReason, { color: colors.textSecondary }]}>
                      {rec.reason}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Toggle Analytics Button */}
        {!showAnalytics && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowAnalytics(true)}
          >
            <Icon name="analytics-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>
              {language === 'ar' ? 'عرض التحليلات والنصائح' : 'Show Analytics & Tips'}
            </Text>
          </TouchableOpacity>
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
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  healthInfo: {
    flex: 1,
  },
  healthStatus: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  motivationalText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  insightInfo: {
    flex: 1,
  },
  insightCategory: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightPercentage: {
    fontSize: 12,
  },
  insightAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightAmountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  recommendationCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 12,
  },
  recommendationCategory: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  recommendationAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recommendationLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  recommendationValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  recommendationReason: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

