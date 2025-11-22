import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpenses } from '../context/ExpenseContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Transaction, ExpenseCategory, IncomeCategory, CURRENCIES } from '../types/expense';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { parseVoiceText } from '../utils/voiceParser';
import { FEATURE_FLAGS } from '../config/featureFlags';

// الألوان ستكون من الثيم - سيتم تمريرها كدالة
const getCategoryColor = (theme: 'light' | 'dark'): string => {
  return theme === 'light' ? '#1A1A1A' : '#FFFFFF';
};

// Mapping categories to icons
const categoryIcons: Record<string, string> = {
  'طعام': 'restaurant',
  'مواصلات': 'car',
  'ترفيه': 'film',
  'صحة': 'medical',
  'ملابس': 'shirt',
  'فواتير': 'receipt',
  'تسوق': 'cart',
  'راتب': 'cash',
  'عمل حر': 'briefcase',
  'استثمار': 'trending-up',
  'هدية': 'gift',
  'مكافأة': 'star',
  'أخرى': 'ellipse',
};

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const { deleteTransaction, formatAmount } = useExpenses();
  const { t, language } = useLanguage();
  const { colors, theme } = useTheme();

  const handleDelete = () => {
    const typeText = transaction.type === 'expense' ? t('add.expense') : t('add.income');
    Alert.alert(
      `${t('common.delete')} ${typeText}`,
      `${t('delete.confirm')} ${typeText} ${t('delete.transaction')}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteTransaction(transaction.id),
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const categoryColor = getCategoryColor(theme);
  const iconColor = theme === 'light' ? '#FFFFFF' : '#000000';
  const iconName = categoryIcons[transaction.category] || 'ellipse';

  return (
    <TouchableOpacity
      style={[styles.transactionCard, { backgroundColor: colors.card }]}
      onLongPress={handleDelete}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: categoryColor }]}>
        <Icon name={iconName} size={24} color={iconColor} />
      </View>
      <View style={styles.transactionContent}>
        <Text style={[styles.transactionTitle, { color: colors.text }]}>{transaction.description}</Text>
        <Text style={[styles.transactionDescription, { color: colors.textSecondary }]}>
          {transaction.description} ({formatAmount(transaction.amount, transaction.currency)})
        </Text>
        <View style={styles.transactionFooter}>
          <Text style={[styles.transactionCategory, { color: colors.textSecondary }]}>{transaction.category}</Text>
          <View style={styles.amountContainer}>
            <Icon
              name={transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}
              size={16}
              color={transaction.type === 'income' ? '#10B981' : '#EF4444'}
              style={styles.amountIcon}
            />
            <Text style={[
              styles.transactionAmount,
              { color: transaction.type === 'income' ? '#10B981' : '#EF4444' }
            ]}>
              {formatAmount(transaction.amount, transaction.currency)}
            </Text>
          </View>
        </View>
        <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>{formatDate(transaction.date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ExpensesList() {
  const navigation = useNavigation();
  const { t, language } = useLanguage();
  const { colors, theme } = useTheme();
  const { transactions, totalExpenses, currency, formatAmount, setCurrency, addTransaction } = useExpenses();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  const { text: voiceText, isListening, error: voiceError, startListening, stopListening, cancelListening } = FEATURE_FLAGS.VOICE_RECOGNITION 
    ? useVoiceRecognition() 
    : { text: '', isListening: false, error: null, startListening: async () => {}, stopListening: async () => {}, cancelListening: async () => {} };

  // Get month name
  const getMonthName = (monthIndex: number) => {
    const date = new Date(selectedYear, monthIndex, 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Get all unique categories from monthly transactions (both expenses and income)
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    transactions.forEach((t) => {
      if (
        new Date(t.date).getMonth() === selectedMonth &&
        new Date(t.date).getFullYear() === selectedYear
      ) {
        categories.add(t.category);
      }
    });
    return Array.from(categories).sort();
  }, [transactions, selectedMonth, selectedYear]);

  // Filter transactions by selected month and category
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const matchesMonth =
        transactionDate.getMonth() === selectedMonth &&
        transactionDate.getFullYear() === selectedYear;
      
      if (!matchesMonth) return false;
      
      // Apply category filter if selected (for both expenses and income)
      if (selectedCategory) {
        return t.category === selectedCategory;
      }
      
      return true; // Show both expenses and income
    });
  }, [transactions, selectedMonth, selectedYear, selectedCategory]);

  // Calculate monthly total
  const monthlyTotal = useMemo(() => {
    return monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyTransactions]);

  // Generate months for selector (last 6 months)
  const months = useMemo(() => {
    const monthsList = [];
    const currentDate = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      monthsList.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        label: `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`,
      });
    }
    return monthsList;
  }, []);

  // Handle voice recognition
  const handleVoicePress = async () => {
    setShowVoiceModal(true);
    await startListening();
  };

  const handleVoiceStop = async () => {
    await stopListening();
  };

  const processVoiceText = useCallback(() => {
    if (voiceText && voiceText.trim().length > 0) {
      const parsed = parseVoiceText(voiceText);
      
      if (parsed) {
        Alert.alert(
          language === 'ar' ? 'تأكيد المعاملة' : 'Confirm Transaction',
          language === 'ar' 
            ? `المبلغ: ${parsed.amount}\nالوصف: ${parsed.description}\nالفئة: ${parsed.category}\nالنوع: ${parsed.type === 'expense' ? 'مصروف' : 'مدخل'}`
            : `Amount: ${parsed.amount}\nDescription: ${parsed.description}\nCategory: ${parsed.category}\nType: ${parsed.type}`,
          [
            {
              text: language === 'ar' ? 'إلغاء' : 'Cancel',
              style: 'cancel',
              onPress: () => {
                setShowVoiceModal(false);
              },
            },
            {
              text: language === 'ar' ? 'إضافة' : 'Add',
              onPress: () => {
                addTransaction({
                  type: parsed.type,
                  amount: parsed.amount,
                  category: parsed.category,
                  description: parsed.description,
                  currency: currency,
                });
                Alert.alert(
                  language === 'ar' ? 'نجح' : 'Success',
                  language === 'ar' ? 'تم إضافة المعاملة بنجاح' : 'Transaction added successfully'
                );
                setShowVoiceModal(false);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          language === 'ar' ? 'خطأ' : 'Error',
          language === 'ar' 
            ? 'لم نتمكن من فهم المعاملة. يرجى المحاولة مرة أخرى.'
            : 'Could not understand the transaction. Please try again.'
        );
      }
    } else {
      setShowVoiceModal(false);
    }
  }, [voiceText, language, currency, addTransaction]);

  const handleVoiceCancel = async () => {
    await cancelListening();
    setShowVoiceModal(false);
  };

  // Auto-process when speech ends
  useEffect(() => {
    if (!isListening && voiceText && showVoiceModal && voiceText.trim().length > 0) {
      // Small delay to ensure text is finalized
      const timer = setTimeout(() => {
        processVoiceText();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isListening, voiceText, showVoiceModal, processVoiceText]);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },
    greetingText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    currencyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 6,
    },
    currencyText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    freeTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 6,
    },
    freeTagText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    summaryCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 20,
      borderRadius: 20,
      padding: 24,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: theme === 'dark' ? 1 : 0,
      borderColor: colors.border,
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 12,
    },
    summaryAmount: {
      fontSize: 42,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -1,
    },
    monthSelectorSection: {
      marginBottom: 24,
    },
    monthSelectorTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    recentExpensesTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      flex: 1,
      paddingHorizontal: 20,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.greetingText}>
          {language === 'ar' ? 'أهلاً' : 'Ahlan'} {language === 'ar' ? '👋' : '👋'}
        </Text>
        <View style={dynamicStyles.headerRight}>
          <TouchableOpacity
            style={dynamicStyles.currencyButton}
            onPress={() => setShowCurrencyModal(true)}
          >
            <Text style={dynamicStyles.currencyText}>
              {CURRENCIES[currency].code}
            </Text>
            <Icon name="chevron-down" size={16} color={colors.text} />
          </TouchableOpacity>
          {FEATURE_FLAGS.VOICE_RECOGNITION && (
            <View style={dynamicStyles.freeTag}>
              <Text style={dynamicStyles.freeTagText}>FREE</Text>
              <Text style={dynamicStyles.freeTagText}>10/15</Text>
              <Icon name="mic" size={16} color={colors.text} />
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)}>
            <Icon name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Card */}
      <View style={dynamicStyles.summaryCard}>
        <Text style={dynamicStyles.summaryTitle}>
          {language === 'ar' 
            ? `مصروفاتي في ${getMonthName(selectedMonth)}` 
            : `My expenses in ${getMonthName(selectedMonth)}`}
        </Text>
        <Text style={dynamicStyles.summaryAmount}>
          {formatAmount(monthlyTotal)}
        </Text>
      </View>

      {/* Month Selector */}
      <View style={styles.monthSelectorContainer}>
        <View style={styles.monthSelectorTitleContainer}>
          <Icon name="calendar-outline" size={20} color={colors.text} />
          <Text style={[dynamicStyles.monthSelectorTitle, { marginLeft: 8 }]}>
            {language === 'ar' ? 'اختر الشهر' : 'Select Month'}
          </Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthsScroll}
        >
          {months.map((month, index) => {
            const isSelected = month.month === selectedMonth && month.year === selectedYear;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.monthButton,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.background,
                  },
                ]}
                onPress={() => {
                  setSelectedMonth(month.month);
                  setSelectedYear(month.year);
                  setSelectedCategory(null); // Reset category when month changes
                }}
              >
                <Text
                  style={[
                    styles.monthButtonText,
                    {
                      color: isSelected ? (theme === 'light' ? '#FFFFFF' : '#000000') : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                >
                  {month.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Category Filter */}
      {availableCategories.length > 0 && (
        <View style={styles.categoryFilterContainer}>
          <View style={styles.categoryFilterTitleContainer}>
            <Icon name="pricetag-outline" size={20} color={colors.text} />
            <Text style={[dynamicStyles.monthSelectorTitle, { marginLeft: 8 }]}>
              {language === 'ar' ? 'الفئات' : 'Categories'}
            </Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {/* All Categories Button */}
            <TouchableOpacity
              style={[
                styles.categoryButton,
                {
                  backgroundColor: !selectedCategory ? colors.primary : colors.background,
                },
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  {
                    color: !selectedCategory ? (theme === 'light' ? '#FFFFFF' : '#000000') : colors.textSecondary,
                    fontWeight: !selectedCategory ? '700' : '600',
                  },
                ]}
              >
                {language === 'ar' ? 'الكل' : 'All'}
              </Text>
            </TouchableOpacity>
            {availableCategories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.background,
                    },
                  ]}
                  onPress={() => {
                    setSelectedCategory(isSelected ? null : category);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      {
                        color: isSelected ? (theme === 'light' ? '#FFFFFF' : '#000000') : colors.textSecondary,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Recent Expenses Title with Add Button */}
      <View style={styles.recentExpensesHeader}>
        <Text style={dynamicStyles.recentExpensesTitle}>
          {language === 'ar' ? 'المصروفات الأخيرة' : 'Recent Expenses'}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => (navigation as any).navigate('AddExpense')}
          activeOpacity={0.7}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <FlatList
        data={monthlyTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {language === 'ar' ? 'لا توجد معاملات لهذا الشهر' : 'No transactions for this month'}
            </Text>
          </View>
        }
      />

      {/* FAB - Only show if voice recognition is enabled */}
      {FEATURE_FLAGS.VOICE_RECOGNITION && (
        <>
          <TouchableOpacity
            style={[
              styles.fab, 
              { 
                backgroundColor: isListening ? colors.error : colors.primary,
                transform: [{ scale: isListening ? 1.1 : 1 }],
              }
            ]}
            onPress={handleVoicePress}
            onLongPress={() => navigation.navigate('AddExpense' as never)}
            activeOpacity={0.8}
          >
            {isListening ? (
              <ActivityIndicator size="small" color={theme === 'light' ? '#FFFFFF' : '#000000'} />
            ) : (
              <Icon name="mic" size={28} color={theme === 'light' ? '#FFFFFF' : '#000000'} />
            )}
          </TouchableOpacity>

          {/* Voice Recognition Modal */}
          <Modal
            visible={showVoiceModal}
            transparent={true}
            animationType="slide"
            onRequestClose={handleVoiceCancel}
          >
        <View style={styles.voiceModalOverlay}>
          <View style={[styles.voiceModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.voiceModalHeader}>
              <Text style={[styles.voiceModalTitle, { color: colors.text }]}>
                {language === 'ar' ? 'التحدث لإضافة معاملة' : 'Speak to Add Transaction'}
              </Text>
              <TouchableOpacity onPress={handleVoiceCancel}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.voiceIndicatorContainer}>
              {isListening ? (
                <>
                  <View style={[styles.voiceIndicator, { backgroundColor: colors.error }]}>
                    <Icon name="mic" size={40} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.voiceStatusText, { color: colors.text }]}>
                    {language === 'ar' ? 'جاري الاستماع...' : 'Listening...'}
                  </Text>
                </>
              ) : (
                <>
                  <View style={[styles.voiceIndicator, { backgroundColor: colors.textSecondary }]}>
                    <Icon name="mic-off" size={40} color={theme === 'light' ? '#FFFFFF' : '#000000'} />
                  </View>
                  <Text style={[styles.voiceStatusText, { color: colors.textSecondary }]}>
                    {language === 'ar' ? 'انتهى الاستماع' : 'Stopped listening'}
                  </Text>
                </>
              )}
            </View>

            {voiceText && (
              <View style={styles.voiceTextContainer}>
                <Text style={[styles.voiceTextLabel, { color: colors.textSecondary }]}>
                  {language === 'ar' ? 'ما تم الاستماع إليه:' : 'Heard:'}
                </Text>
                <Text style={[styles.voiceText, { color: colors.text }]}>
                  {voiceText}
                </Text>
              </View>
            )}

            {voiceError && (
              <View style={styles.voiceErrorContainer}>
                <Text style={[styles.voiceErrorText, { color: colors.error }]}>
                  {voiceError}
                </Text>
              </View>
            )}

            <View style={styles.voiceButtonsContainer}>
              {isListening ? (
                <TouchableOpacity
                  style={[styles.voiceButton, { backgroundColor: colors.error }]}
                  onPress={handleVoiceStop}
                >
                  <Icon name="stop" size={24} color="#FFFFFF" />
                  <Text style={styles.voiceButtonText}>
                    {language === 'ar' ? 'إيقاف' : 'Stop'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.voiceButton, { backgroundColor: colors.primary }]}
                  onPress={handleVoicePress}
                >
                  <Icon name="mic" size={24} color={theme === 'light' ? '#FFFFFF' : '#000000'} />
                  <Text style={[styles.voiceButtonText, { color: theme === 'light' ? '#FFFFFF' : '#000000' }]}>
                    {language === 'ar' ? 'ابدأ التحدث' : 'Start Speaking'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.voiceHintText, { color: colors.textSecondary }]}>
              {language === 'ar' 
                ? 'مثال: "مصروف 100 ريال على طعام" أو "راتب 5000 ريال"'
                : 'Example: "Expense 100 SAR for food" or "Salary 5000 SAR"'}
            </Text>
          </View>
        </View>
      </Modal>
        </>
      )}

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCurrencyModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {language === 'ar' ? 'اختر العملة' : 'Select Currency'}
            </Text>
            {Object.values(CURRENCIES).map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyOption,
                  currency === curr.code && { backgroundColor: colors.primary + '20' },
                ]}
                onPress={() => {
                  setCurrency(curr.code);
                  setShowCurrencyModal(false);
                }}
              >
                <Text style={[styles.currencyOptionText, { color: colors.text }]}>
                  {curr.code} - {curr.name}
                </Text>
                {currency === curr.code && (
                  <Icon name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  monthSelectorContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  monthSelectorTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthsScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 4,
  },
  monthButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  monthButtonText: {
    fontSize: 14,
  },
  categoryFilterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryFilterTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recentExpensesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clearCategoryButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearCategoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 14,
  },
  transactionCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 13,
    fontWeight: '500',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountIcon: {
    marginRight: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  transactionDate: {
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 24,
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  currencyOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  voiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceModalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voiceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  voiceIndicatorContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  voiceIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  voiceTextContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  voiceTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  voiceText: {
    fontSize: 16,
    lineHeight: 24,
  },
  voiceErrorContainer: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  voiceErrorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  voiceButtonsContainer: {
    marginBottom: 16,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  voiceHintText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
