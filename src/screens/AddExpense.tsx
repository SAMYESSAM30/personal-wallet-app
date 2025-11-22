import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ExpenseCategory, IncomeCategory, TransactionType, CURRENCIES } from '../types/expense';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const expenseCategories: ExpenseCategory[] = [
  'طعام',
  'مواصلات',
  'ترفيه',
  'صحة',
  'ملابس',
  'فواتير',
  'تسوق',
  'أخرى',
];

const incomeCategories: IncomeCategory[] = [
  'راتب',
  'عمل حر',
  'استثمار',
  'هدية',
  'مكافأة',
  'أخرى',
];

const expenseCategoryColors: Record<ExpenseCategory, string> = {
  'طعام': '#FF6B6B',
  'مواصلات': '#4ECDC4',
  'ترفيه': '#FFE66D',
  'صحة': '#95E1D3',
  'ملابس': '#F38181',
  'فواتير': '#AA96DA',
  'تسوق': '#FCBAD3',
  'أخرى': '#C7CEEA',
};

const incomeCategoryColors: Record<IncomeCategory, string> = {
  'راتب': '#51CF66',
  'عمل حر': '#74B9FF',
  'استثمار': '#A29BFE',
  'هدية': '#FD79A8',
  'مكافأة': '#FDCB6E',
  'أخرى': '#C7CEEA',
};

export default function AddExpense() {
  const navigation = useNavigation();
  const route = useRoute();
  const { addTransaction, currency, formatAmount, customCategories } = useExpenses();
  const { colors, theme } = useTheme();
  const { t } = useLanguage();
  
  // الحصول على النوع من route params أو افتراض أنه مصروف
  const defaultType = (route.params as any)?.type || 'expense';
  const [transactionType, setTransactionType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // دمج الفئات الافتراضية مع الفئات المخصصة
  const defaultCategories = transactionType === 'expense' ? expenseCategories : incomeCategories;
  const customCats = customCategories
    .filter((cat) => cat.type === transactionType)
    .map((cat) => cat.name);
  const categories = [...defaultCategories, ...customCats];
  
  // دمج ألوان الفئات
  const defaultCategoryColors = transactionType === 'expense' ? expenseCategoryColors : incomeCategoryColors;
  const customCategoryColorsMap: Record<string, string> = {};
  customCategories
    .filter((cat) => cat.type === transactionType)
    .forEach((cat) => {
      customCategoryColorsMap[cat.name] = cat.color;
    });
  
  const getCategoryColor = (category: string): string => {
    return customCategoryColorsMap[category] || defaultCategoryColors[category as keyof typeof defaultCategoryColors] || '#C7CEEA';
  };

  const handleAddTransaction = () => {
    if (!amount || !description || !selectedCategory) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال مبلغ صحيح');
      return;
    }

    addTransaction({
      type: transactionType,
      amount: amountNum,
      category: selectedCategory,
      description: description.trim(),
      currency: currency,
    });

    const typeText = transactionType === 'expense' ? 'مصروف' : 'مدخل';
    Alert.alert(
      'نجح!',
      `تم إضافة ${typeText} ${amountNum} ريال في فئة ${selectedCategory}`,
      [
        {
          text: 'حسناً',
          onPress: () => {
            setAmount('');
            setDescription('');
            setSelectedCategory(null);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      letterSpacing: 0.3,
    },
    typeButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    typeButtonActive: {
      borderColor: colors.text,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    typeButtonText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    typeButtonTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    label: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'right',
      letterSpacing: 0.2,
    },
    input: {
      backgroundColor: theme === 'dark' ? '#1E293B' : '#F1F5F9',
      borderRadius: 14,
      padding: 16,
      fontSize: 17,
      color: colors.text,
      textAlign: 'right',
      borderWidth: 1.5,
      borderColor: colors.border,
      fontWeight: '500',
    },
    submitButton: {
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      marginTop: 24,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 19,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={dynamicStyles.title}>
              {transactionType === 'expense' ? t('add.title') : t('add.titleIncome')}
            </Text>
          </View>

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                dynamicStyles.typeButton,
                transactionType === 'expense' && dynamicStyles.typeButtonActive,
                { backgroundColor: transactionType === 'expense' ? colors.error : (theme === 'dark' ? '#1E293B' : '#F1F5F9') },
              ]}
              onPress={() => {
                setTransactionType('expense');
                setSelectedCategory(null);
              }}
            >
              <Text
                style={[
                  dynamicStyles.typeButtonText,
                  transactionType === 'expense' && dynamicStyles.typeButtonTextActive,
                ]}
              >
                {t('add.expense')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                dynamicStyles.typeButton,
                transactionType === 'income' && dynamicStyles.typeButtonActive,
                { backgroundColor: transactionType === 'income' ? colors.success : (theme === 'dark' ? '#1E293B' : '#F1F5F9') },
              ]}
              onPress={() => {
                setTransactionType('income');
                setSelectedCategory(null);
              }}
            >
              <Text
                style={[
                  dynamicStyles.typeButtonText,
                  transactionType === 'income' && dynamicStyles.typeButtonTextActive,
                ]}
              >
                {t('add.income')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('add.amount')} ({CURRENCIES[currency].symbol})</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder={t('add.enterAmount')}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('add.description')}</Text>
              <TextInput
                style={[dynamicStyles.input, styles.textArea]}
                placeholder={t('add.enterDescription')}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={dynamicStyles.label}>{t('add.category')}</Text>
              <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.categoryButtonSelected,
                      {
                        backgroundColor:
                          selectedCategory === category
                            ? getCategoryColor(category)
                            : (theme === 'dark' ? '#1E293B' : '#F1F5F9'),
                        borderColor: selectedCategory === category ? getCategoryColor(category) : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === category && styles.categoryTextSelected,
                        { color: selectedCategory === category ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[
                dynamicStyles.submitButton,
                (!amount || !description || !selectedCategory) && styles.submitButtonDisabled,
                { backgroundColor: transactionType === 'expense' ? colors.error : colors.success },
              ]}
              onPress={handleAddTransaction}
              disabled={!amount || !description || !selectedCategory}
            >
              <Text style={dynamicStyles.submitButtonText}>
                {transactionType === 'expense' ? t('add.addExpense') : t('add.addIncome')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  typeButtonActive: {
    borderColor: '#333',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 22,
    marginBottom: 10,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryButtonSelected: {
    borderWidth: 2,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  categoryTextSelected: {
    fontWeight: '700',
  },
  submitButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
