import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@expense_app_language';

// ملفات الترجمة
const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.transactions': 'المعاملات',
    'nav.add': 'إضافة',
    'nav.settings': 'الإعدادات',
    'nav.reports': 'التقارير',
    
    // Common
    'common.all': 'الكل',
    'common.today': 'اليوم',
    'common.week': 'هذا الأسبوع',
    'common.month': 'هذا الشهر',
    'common.filter': 'فلتر',
    'common.clearFilter': 'إزالة الفلتر',
    'common.apply': 'تطبيق',
    'common.reset': 'إعادة تعيين',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.close': 'إغلاق',
    
    // Expenses List
    'expenses.balance': 'الرصيد',
    'expenses.income': 'المدخلات',
    'expenses.expenses': 'المصروفات',
    'expenses.noTransactions': 'لا توجد معاملات حتى الآن',
    'expenses.startAdding': 'ابدأ بإضافة مصروفاتك ومدخلاتك',
    'expenses.addTransaction': 'إضافة معاملة جديدة',
    'expenses.noFilteredResults': 'لا توجد معاملات تطابق الفلتر المحدد',
    'expenses.filter': 'الفلتر',
    'expenses.date': 'التاريخ',
    'expenses.category': 'الفئة',
    
    // Add Expense
    'add.title': 'إضافة مصروف جديد',
    'add.titleIncome': 'إضافة مدخل جديد',
    'add.amount': 'المبلغ',
    'add.description': 'الوصف',
    'add.category': 'الفئة',
    'add.expense': 'مصروف',
    'add.income': 'مدخل',
    'add.addExpense': 'إضافة المصروف',
    'add.addIncome': 'إضافة المدخل',
    'add.enterAmount': 'أدخل المبلغ',
    'add.enterDescription': 'أدخل وصف',
    'add.fillAllFields': 'يرجى ملء جميع الحقول',
    'add.validAmount': 'يرجى إدخال مبلغ صحيح',
    'add.success': 'نجح!',
    'add.successMessage': 'تم إضافة',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.currency': 'العملة',
    'settings.statistics': 'الإحصائيات',
    'settings.totalTransactions': 'إجمالي المعاملات',
    'settings.totalIncome': 'إجمالي المدخلات',
    'settings.totalExpenses': 'إجمالي المصروفات',
    'settings.currentBalance': 'الرصيد الحالي',
    'settings.actions': 'الإجراءات',
    'settings.shareAndExport': 'المشاركة والتصدير',
    'settings.export': 'تصدير إلى الإيميل',
    'settings.shareText': 'مشاركة كـ نص',
    'settings.shareCSV': 'مشاركة كـ CSV',
    'settings.shareJSON': 'مشاركة كـ JSON',
    'settings.shareError': 'حدث خطأ أثناء المشاركة',
    'settings.deleteAll': 'حذف جميع المعاملات',
    'settings.deleteAllConfirm': 'هل أنت متأكد من حذف جميع المعاملات؟ لا يمكن التراجع عن هذا الإجراء.',
    'settings.deleteAllSuccess': 'تم حذف جميع المعاملات',
    'settings.noTransactions': 'لا توجد معاملات لحذفها',
    'settings.noTransactionsExport': 'لا توجد معاملات للتصدير',
    'settings.manageCategories': 'إدارة الفئات',
    'settings.information': 'المعلومات',
    'settings.faq': 'الأسئلة الشائعة',
    'settings.about': 'حول التطبيق',
    'settings.privacy': 'سياسة الخصوصية',
    'settings.language': 'اللغة',
    'settings.theme': 'المظهر',
    'settings.monthlyReset': 'إعادة التعيين الشهرية',
    'settings.monthlyResetDesc': 'حذف جميع المعاملات تلقائياً في بداية كل شهر',
    'settings.monthlyResetConfirm': 'هل تريد تفعيل إعادة التعيين الشهرية؟ سيتم حذف جميع المعاملات تلقائياً في بداية كل شهر.',
    'settings.sync': 'المزامنة بين الأجهزة',
    'settings.syncDesc': 'مزامنة بياناتك بين جميع أجهزتك تلقائياً',
    'settings.syncConfirm': 'هل تريد تفعيل المزامنة بين الأجهزة؟ سيتم رفع بياناتك إلى السحابة ومزامنتها مع أجهزتك الأخرى.',
    'settings.syncDisableConfirm': 'هل تريد تعطيل المزامنة؟ لن يتم مزامنة بياناتك بعد الآن.',
    'settings.syncEnabled': 'تم تفعيل المزامنة بنجاح',
    'settings.syncDisabled': 'تم تعطيل المزامنة',
    'settings.syncNow': 'مزامنة الآن',
    'settings.syncSuccess': 'تمت المزامنة بنجاح',
    'settings.syncError': 'حدث خطأ أثناء المزامنة',
    'common.error': 'خطأ',
    
    // Categories
    'categories.title': 'إدارة الفئات',
    'categories.addNew': 'إضافة فئة جديدة',
    'categories.expenseCategories': 'فئات المصروفات المخصصة',
    'categories.incomeCategories': 'فئات المدخلات المخصصة',
    'categories.noCustom': 'لا توجد فئات مخصصة',
    'categories.categoryName': 'اسم الفئة',
    'categories.selectColor': 'اختر اللون',
    'categories.deleteConfirm': 'هل أنت متأكد من حذف فئة',
    'categories.addSuccess': 'تم إضافة الفئة بنجاح',
    'categories.deleteSuccess': 'تم حذف الفئة',
    'categories.enterName': 'يرجى إدخال اسم الفئة',
    'categories.exists': 'هذه الفئة موجودة بالفعل',
    
    // Delete
    'delete.confirm': 'هل أنت متأكد من حذف',
    'delete.transaction': 'هذه المعاملة؟',
    'delete.category': 'هذه الفئة؟',
    
    // Default Categories
    'category.food': 'طعام',
    'category.transport': 'مواصلات',
    'category.entertainment': 'ترفيه',
    'category.health': 'صحة',
    'category.clothing': 'ملابس',
    'category.bills': 'فواتير',
    'category.shopping': 'تسوق',
    'category.other': 'أخرى',
    'category.salary': 'راتب',
    'category.freelance': 'عمل حر',
    'category.investment': 'استثمار',
    'category.gift': 'هدية',
    'category.bonus': 'مكافأة',
  },
  en: {
    // Navigation
    'nav.transactions': 'Transactions',
    'nav.add': 'Add',
    'nav.settings': 'Settings',
    'nav.reports': 'Reports',
    
    // Common
    'common.all': 'All',
    'common.today': 'Today',
    'common.week': 'This Week',
    'common.month': 'This Month',
    'common.filter': 'Filter',
    'common.clearFilter': 'Clear Filter',
    'common.apply': 'Apply',
    'common.reset': 'Reset',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.close': 'Close',
    
    // Expenses List
    'expenses.balance': 'Balance',
    'expenses.income': 'Income',
    'expenses.expenses': 'Expenses',
    'expenses.noTransactions': 'No transactions yet',
    'expenses.startAdding': 'Start adding your expenses and income',
    'expenses.addTransaction': 'Add New Transaction',
    'expenses.noFilteredResults': 'No transactions match the selected filter',
    'expenses.filter': 'Filter',
    'expenses.date': 'Date',
    'expenses.category': 'Category',
    
    // Add Expense
    'add.title': 'Add New Expense',
    'add.titleIncome': 'Add New Income',
    'add.amount': 'Amount',
    'add.description': 'Description',
    'add.category': 'Category',
    'add.expense': 'Expense',
    'add.income': 'Income',
    'add.addExpense': 'Add Expense',
    'add.addIncome': 'Add Income',
    'add.enterAmount': 'Enter amount',
    'add.enterDescription': 'Enter description',
    'add.fillAllFields': 'Please fill all fields',
    'add.validAmount': 'Please enter a valid amount',
    'add.success': 'Success!',
    'add.successMessage': 'Added',
    
    // Settings
    'settings.title': 'Settings',
    'settings.currency': 'Currency',
    'settings.statistics': 'Statistics',
    'settings.totalTransactions': 'Total Transactions',
    'settings.totalIncome': 'Total Income',
    'settings.totalExpenses': 'Total Expenses',
    'settings.currentBalance': 'Current Balance',
    'settings.actions': 'Actions',
    'settings.shareAndExport': 'Share and Export',
    'settings.export': 'Export to Email',
    'settings.shareText': 'Share as Text',
    'settings.shareCSV': 'Share as CSV',
    'settings.shareJSON': 'Share as JSON',
    'settings.shareError': 'An error occurred while sharing',
    'settings.deleteAll': 'Delete All Transactions',
    'settings.deleteAllConfirm': 'Are you sure you want to delete all transactions? This action cannot be undone.',
    'settings.deleteAllSuccess': 'All transactions deleted',
    'settings.noTransactions': 'No transactions to delete',
    'settings.noTransactionsExport': 'No transactions to export',
    'settings.manageCategories': 'Manage Categories',
    'settings.information': 'Information',
    'settings.faq': 'FAQ',
    'settings.about': 'About',
    'settings.privacy': 'Privacy Policy',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.monthlyReset': 'Monthly Reset',
    'settings.monthlyResetDesc': 'Automatically delete all transactions at the start of each month',
    'settings.monthlyResetConfirm': 'Do you want to enable monthly reset? All transactions will be automatically deleted at the start of each month.',
    'settings.sync': 'Sync Between Devices',
    'settings.syncDesc': 'Automatically sync your data across all your devices',
    'settings.syncConfirm': 'Do you want to enable sync between devices? Your data will be uploaded to the cloud and synced with your other devices.',
    'settings.syncDisableConfirm': 'Do you want to disable sync? Your data will no longer be synced.',
    'settings.syncEnabled': 'Sync enabled successfully',
    'settings.syncDisabled': 'Sync disabled',
    'settings.syncNow': 'Sync Now',
    'settings.syncSuccess': 'Sync completed successfully',
    'settings.syncError': 'An error occurred during sync',
    'common.error': 'Error',
    
    // Categories
    'categories.title': 'Manage Categories',
    'categories.addNew': 'Add New Category',
    'categories.expenseCategories': 'Custom Expense Categories',
    'categories.incomeCategories': 'Custom Income Categories',
    'categories.noCustom': 'No custom categories',
    'categories.categoryName': 'Category Name',
    'categories.selectColor': 'Select Color',
    'categories.deleteConfirm': 'Are you sure you want to delete category',
    'categories.addSuccess': 'Category added successfully',
    'categories.deleteSuccess': 'Category deleted',
    'categories.enterName': 'Please enter category name',
    'categories.exists': 'This category already exists',
    
    // Delete
    'delete.confirm': 'Are you sure you want to delete',
    'delete.transaction': 'this transaction?',
    'delete.category': 'this category?',
    
    // Default Categories
    'category.food': 'Food',
    'category.transport': 'Transport',
    'category.entertainment': 'Entertainment',
    'category.health': 'Health',
    'category.clothing': 'Clothing',
    'category.bills': 'Bills',
    'category.shopping': 'Shopping',
    'category.other': 'Other',
    'category.salary': 'Salary',
    'category.freelance': 'Freelance',
    'category.investment': 'Investment',
    'category.gift': 'Gift',
    'category.bonus': 'Bonus',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

