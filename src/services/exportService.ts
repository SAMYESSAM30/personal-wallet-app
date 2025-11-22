/**
 * Export Service
 * Handles exporting and sharing data in various formats
 */

import { Share, Platform } from 'react-native';
import { Transaction, Currency } from '../types/expense';

export interface ExportOptions {
  format: 'csv' | 'json' | 'text';
  includeSummary?: boolean;
}

class ExportService {
  /**
   * Export transactions to CSV format
   */
  exportToCSV(transactions: Transaction[], currency: Currency): string {
    const headers = ['Date', 'Type', 'Amount', 'Category', 'Description', 'Currency'];
    const rows = transactions.map(t => [
      new Date(t.date).toISOString(),
      t.type,
      t.amount.toString(),
      t.category,
      t.description,
      t.currency || currency,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Export transactions to JSON format
   */
  exportToJSON(transactions: Transaction[]): string {
    return JSON.stringify(transactions, null, 2);
  }

  /**
   * Export transactions to readable text format
   */
  exportToText(
    transactions: Transaction[],
    currency: Currency,
    totalIncome: number,
    totalExpenses: number,
    balance: number,
    formatAmount: (amount: number, currencyCode?: Currency) => string,
    language: 'ar' | 'en'
  ): string {
    const isArabic = language === 'ar';
    
    let text = isArabic ? 'ملخص المعاملات المالية\n\n' : 'Financial Transactions Summary\n\n';
    
    // Summary
    text += isArabic ? 'الإحصائيات:\n' : 'Statistics:\n';
    text += isArabic ? `إجمالي المدخلات: ${formatAmount(totalIncome, currency)}\n` : `Total Income: ${formatAmount(totalIncome, currency)}\n`;
    text += isArabic ? `إجمالي المصروفات: ${formatAmount(totalExpenses, currency)}\n` : `Total Expenses: ${formatAmount(totalExpenses, currency)}\n`;
    text += isArabic ? `الرصيد: ${formatAmount(balance, currency)}\n` : `Balance: ${formatAmount(balance, currency)}\n`;
    text += isArabic ? `عدد المعاملات: ${transactions.length}\n\n` : `Total Transactions: ${transactions.length}\n\n`;
    
    text += '='.repeat(50) + '\n';
    text += isArabic ? 'تفاصيل المعاملات:\n' : 'Transaction Details:\n';
    text += '='.repeat(50) + '\n\n';

    if (transactions.length === 0) {
      text += isArabic ? 'لا توجد معاملات\n' : 'No transactions\n';
    } else {
      transactions.forEach((transaction, index) => {
        const typeText = transaction.type === 'expense' 
          ? (isArabic ? 'مصروف' : 'Expense')
          : (isArabic ? 'مدخل' : 'Income');
        
        text += `${index + 1}. ${typeText}\n`;
        text += isArabic ? `   المبلغ: ${formatAmount(transaction.amount, transaction.currency)}\n` : `   Amount: ${formatAmount(transaction.amount, transaction.currency)}\n`;
        text += isArabic ? `   الفئة: ${transaction.category}\n` : `   Category: ${transaction.category}\n`;
        text += isArabic ? `   الوصف: ${transaction.description}\n` : `   Description: ${transaction.description}\n`;
        text += isArabic ? `   التاريخ: ` : `   Date: `;
        text += new Date(transaction.date).toLocaleDateString(
          isArabic ? 'ar-SA' : 'en-US',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }
        );
        text += '\n\n';
      });
    }

    return text;
  }

  /**
   * Share data using native share dialog
   */
  async shareData(
    content: string,
    title: string,
    mimeType?: string
  ): Promise<void> {
    try {
      const shareOptions: any = {
        message: content,
        title: title,
      };

      if (Platform.OS === 'android' && mimeType) {
        shareOptions.mimeType = mimeType;
      }

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // Shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error: any) {
      console.error('Error sharing data:', error);
      throw new Error(error.message || 'Failed to share data');
    }
  }

  /**
   * Export and share transactions
   */
  async exportAndShare(
    transactions: Transaction[],
    currency: Currency,
    totalIncome: number,
    totalExpenses: number,
    balance: number,
    formatAmount: (amount: number, currencyCode?: Currency) => string,
    language: 'ar' | 'en',
    options: ExportOptions
  ): Promise<void> {
    let content: string;
    let title: string;
    let mimeType: string | undefined;

    const isArabic = language === 'ar';

    switch (options.format) {
      case 'csv':
        content = this.exportToCSV(transactions, currency);
        title = isArabic ? 'المعاملات المالية.csv' : 'Financial Transactions.csv';
        mimeType = 'text/csv';
        break;
      
      case 'json':
        content = this.exportToJSON(transactions);
        title = isArabic ? 'المعاملات المالية.json' : 'Financial Transactions.json';
        mimeType = 'application/json';
        break;
      
      case 'text':
      default:
        content = this.exportToText(
          transactions,
          currency,
          totalIncome,
          totalExpenses,
          balance,
          formatAmount,
          language
        );
        title = isArabic ? 'ملخص المعاملات المالية' : 'Financial Transactions Summary';
        mimeType = 'text/plain';
        break;
    }

    await this.shareData(content, title, mimeType);
  }
}

// Export singleton instance
export const exportService = new ExportService();

