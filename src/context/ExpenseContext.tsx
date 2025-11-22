import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Transaction, TransactionType, Currency, CURRENCIES, CustomCategory } from '../types/expense';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ExpenseContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number, currencyCode?: Currency) => string;
  customCategories: CustomCategory[];
  addCustomCategory: (category: Omit<CustomCategory, 'id'>) => void;
  deleteCustomCategory: (id: string) => void;
  exportToEmail: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = '@expense_app_currency';
const CUSTOM_CATEGORIES_STORAGE_KEY = '@expense_app_custom_categories';
const TRANSACTIONS_STORAGE_KEY = '@expense_app_transactions';

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrencyState] = useState<Currency>('SAR');
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);

  // تحميل البيانات المحفوظة عند بدء التطبيق
  useEffect(() => {
    loadCurrency();
    loadCustomCategories();
    loadTransactions();
  }, []);

  const loadCurrency = async () => {
    try {
      const savedCurrency = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
      if (savedCurrency && (savedCurrency === 'SAR' || savedCurrency === 'USD' || savedCurrency === 'EGP')) {
        setCurrencyState(savedCurrency as Currency);
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    }
  };

  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const saved = await AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // تحويل strings إلى Date objects
        const transactionsWithDates = parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
        setTransactions(transactionsWithDates);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const saveTransactions = async (transactionsToSave: Transaction[]) => {
    try {
      await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactionsToSave));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date(),
      currency: transaction.currency || currency, // استخدام العملة المحددة أو الافتراضية
    };
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const formatAmount = (amount: number, currencyCode?: Currency): string => {
    const curr = currencyCode || currency;
    const currencyInfo = CURRENCIES[curr];
    const formattedAmount = amount.toFixed(2);
    
    if (curr === 'USD') {
      return `${currencyInfo.symbol}${formattedAmount}`;
    } else if (curr === 'EGP') {
      return `${formattedAmount} ${currencyInfo.symbol}`;
    } else {
      return `${formattedAmount} ${currencyInfo.symbol}`;
    }
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter((transaction) => transaction.id !== id);
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const clearAllTransactions = async () => {
    setTransactions([]);
    await saveTransactions([]);
  };

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = totalIncome - totalExpenses;

  const loadCustomCategories = async () => {
    try {
      const saved = await AsyncStorage.getItem(CUSTOM_CATEGORIES_STORAGE_KEY);
      if (saved) {
        setCustomCategories(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading custom categories:', error);
    }
  };

  const saveCustomCategories = async (categories: CustomCategory[]) => {
    try {
      await AsyncStorage.setItem(CUSTOM_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving custom categories:', error);
    }
  };

  const addCustomCategory = async (category: Omit<CustomCategory, 'id'>) => {
    const newCategory: CustomCategory = {
      ...category,
      id: Date.now().toString(),
    };
    const updated = [...customCategories, newCategory];
    setCustomCategories(updated);
    await saveCustomCategories(updated);
  };

  const deleteCustomCategory = async (id: string) => {
    const updated = customCategories.filter((cat) => cat.id !== id);
    setCustomCategories(updated);
    await saveCustomCategories(updated);
  };

  const exportToEmail = async () => {
    try {
      const { Linking } = require('react-native');
      const emailSubject = 'تصدير بيانات المصروفات';
      let emailBody = 'ملخص المعاملات المالية\n\n';
      emailBody += `إجمالي المدخلات: ${formatAmount(totalIncome)}\n`;
      emailBody += `إجمالي المصروفات: ${formatAmount(totalExpenses)}\n`;
      emailBody += `الرصيد: ${formatAmount(balance)}\n`;
      emailBody += `عدد المعاملات: ${transactions.length}\n\n`;
      emailBody += '='.repeat(50) + '\n';
      emailBody += 'تفاصيل المعاملات:\n';
      emailBody += '='.repeat(50) + '\n\n';

      if (transactions.length === 0) {
        emailBody += 'لا توجد معاملات\n';
      } else {
        transactions.forEach((transaction, index) => {
          emailBody += `${index + 1}. ${transaction.type === 'expense' ? 'مصروف' : 'مدخل'}\n`;
          emailBody += `   المبلغ: ${formatAmount(transaction.amount, transaction.currency)}\n`;
          emailBody += `   الفئة: ${transaction.category}\n`;
          emailBody += `   الوصف: ${transaction.description}\n`;
          emailBody += `   التاريخ: ${new Date(transaction.date).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}\n`;
          emailBody += '\n';
        });
      }

      const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        throw new Error('لا يمكن فتح تطبيق البريد الإلكتروني');
      }
    } catch (error: any) {
      throw new Error(error.message || 'حدث خطأ أثناء التصدير');
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        clearAllTransactions,
        totalExpenses,
        totalIncome,
        balance,
        currency,
        setCurrency,
        formatAmount,
        customCategories,
        addCustomCategory,
        deleteCustomCategory,
        exportToEmail,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
