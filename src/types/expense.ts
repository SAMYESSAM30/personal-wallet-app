export type TransactionType = 'expense' | 'income';

export type Currency = 'SAR' | 'USD' | 'EGP';

export interface CurrencyInfo {
  code: Currency;
  name: string;
  symbol: string;
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  SAR: {
    code: 'SAR',
    name: 'ريال سعودي',
    symbol: 'ريال',
  },
  USD: {
    code: 'USD',
    name: 'دولار أمريكي',
    symbol: '$',
  },
  EGP: {
    code: 'EGP',
    name: 'جنيه مصري',
    symbol: 'ج.م',
  },
};

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: Date;
  currency?: Currency; // العملة المستخدمة عند إضافة المعاملة
}

export type ExpenseCategory =
  | 'طعام'
  | 'مواصلات'
  | 'ترفيه'
  | 'صحة'
  | 'ملابس'
  | 'فواتير'
  | 'تسوق'
  | 'أخرى';

export type IncomeCategory =
  | 'راتب'
  | 'عمل حر'
  | 'استثمار'
  | 'هدية'
  | 'مكافأة'
  | 'أخرى';

export interface CustomCategory {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
}

// للتوافق مع الكود القديم
export interface Expense extends Transaction {
  type: 'expense';
}

