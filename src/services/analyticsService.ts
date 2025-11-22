/**
 * Analytics Service
 * Provides advanced financial analytics and insights
 */

import { Transaction } from '../types/expense';

export interface SpendingTrend {
  period: string;
  amount: number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
}

export interface CategoryInsight {
  category: string;
  totalAmount: number;
  percentage: number;
  averagePerTransaction: number;
  transactionCount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface FinancialHealth {
  score: number; // 0-100
  status: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
}

export interface MonthlyComparison {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number; // percentage
}

class AnalyticsService {
  /**
   * Calculate spending trends
   */
  calculateSpendingTrends(transactions: Transaction[], period: 'week' | 'month' | 'year'): SpendingTrend[] {
    const trends: SpendingTrend[] = [];
    const now = new Date();
    
    let periods: number;
    let periodLabel: (date: Date) => string;
    
    if (period === 'week') {
      periods = 4; // Last 4 weeks
      periodLabel = (date) => `Week ${Math.ceil((now.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
    } else if (period === 'month') {
      periods = 6; // Last 6 months
      periodLabel = (date) => date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
      periods = 3; // Last 3 years
      periodLabel = (date) => date.getFullYear().toString();
    }

    const periodData: { date: Date; amount: number }[] = [];

    for (let i = periods - 1; i >= 0; i--) {
      const periodStart = new Date(now);
      const periodEnd = new Date(now);
      
      if (period === 'week') {
        periodStart.setDate(periodStart.getDate() - (i + 1) * 7);
        periodEnd.setDate(periodEnd.getDate() - i * 7);
      } else if (period === 'month') {
        periodStart.setMonth(periodStart.getMonth() - (i + 1));
        periodEnd.setMonth(periodEnd.getMonth() - i);
      } else {
        periodStart.setFullYear(periodStart.getFullYear() - (i + 1));
        periodEnd.setFullYear(periodEnd.getFullYear() - i);
      }

      const periodTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= periodStart && tDate < periodEnd && t.type === 'expense';
      });

      const total = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
      periodData.push({ date: periodStart, amount: total });
    }

    periodData.forEach((data, index) => {
      const previousAmount = index > 0 ? periodData[index - 1].amount : data.amount;
      const change = previousAmount > 0 
        ? ((data.amount - previousAmount) / previousAmount) * 100 
        : 0;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (change > 5) trend = 'up';
      else if (change < -5) trend = 'down';

      trends.push({
        period: periodLabel(data.date),
        amount: data.amount,
        change: Math.round(change * 10) / 10,
        trend,
      });
    });

    return trends;
  }

  /**
   * Get category insights
   */
  getCategoryInsights(transactions: Transaction[], periodDays: number = 30): CategoryInsight[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    const recentTransactions = transactions.filter(
      t => new Date(t.date) >= cutoffDate && t.type === 'expense'
    );

    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    recentTransactions.forEach(t => {
      const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: existing.amount + t.amount,
        count: existing.count + 1,
      });
    });

    const totalAmount = Array.from(categoryMap.values())
      .reduce((sum, cat) => sum + cat.amount, 0);

    const insights: CategoryInsight[] = Array.from(categoryMap.entries()).map(([category, data]) => {
      // Calculate trend (simplified - compare with previous period)
      const previousCutoff = new Date(cutoffDate);
      previousCutoff.setDate(previousCutoff.getDate() - periodDays);
      
      const previousTransactions = transactions.filter(
        t => {
          const tDate = new Date(t.date);
          return tDate >= previousCutoff && tDate < cutoffDate && t.type === 'expense' && t.category === category;
        }
      );
      
      const previousAmount = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
      const currentAmount = data.amount;
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (previousAmount > 0) {
        const change = ((currentAmount - previousAmount) / previousAmount) * 100;
        if (change > 10) trend = 'increasing';
        else if (change < -10) trend = 'decreasing';
      }

      return {
        category,
        totalAmount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        averagePerTransaction: data.count > 0 ? data.amount / data.count : 0,
        transactionCount: data.count,
        trend,
      };
    });

    return insights.sort((a, b) => b.totalAmount - a.totalAmount);
  }

  /**
   * Calculate financial health score
   */
  calculateFinancialHealth(
    transactions: Transaction[],
    totalIncome: number,
    totalExpenses: number
  ): FinancialHealth {
    const recommendations: string[] = [];
    let score = 100;

    // Check savings rate
    const savingsRate = totalIncome > 0 
      ? ((totalIncome - totalExpenses) / totalIncome) * 100 
      : 0;
    
    if (savingsRate < 0) {
      score -= 30;
      recommendations.push('You are spending more than you earn. Consider reducing expenses or increasing income.');
    } else if (savingsRate < 10) {
      score -= 15;
      recommendations.push('Your savings rate is low. Try to save at least 10-20% of your income.');
    } else if (savingsRate >= 20) {
      score += 10;
      recommendations.push('Great! You have a healthy savings rate.');
    }

    // Check expense consistency
    const last30Days = transactions.filter(t => {
      const tDate = new Date(t.date);
      const daysAgo = (Date.now() - tDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30 && t.type === 'expense';
    });

    const avgDailyExpense = last30Days.length > 0
      ? last30Days.reduce((sum, t) => sum + t.amount, 0) / 30
      : 0;

    if (avgDailyExpense > totalIncome / 30) {
      score -= 20;
      recommendations.push('Your daily expenses exceed your daily income. Review your spending habits.');
    }

    // Check category diversity
    const categories = new Set(transactions.map(t => t.category));
    if (categories.size < 3) {
      score -= 10;
      recommendations.push('Consider diversifying your spending categories for better tracking.');
    }

    // Check transaction frequency
    if (transactions.length < 5) {
      score -= 5;
      recommendations.push('Add more transactions to get better insights.');
    }

    // Determine status
    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 80) status = 'excellent';
    else if (score >= 60) status = 'good';
    else if (score >= 40) status = 'fair';
    else status = 'poor';

    return {
      score: Math.max(0, Math.min(100, score)),
      status,
      recommendations: recommendations.length > 0 ? recommendations : ['Keep up the good work!'],
    };
  }

  /**
   * Compare monthly performance
   */
  getMonthlyComparison(transactions: Transaction[], months: number = 6): MonthlyComparison[] {
    const comparisons: MonthlyComparison[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const savings = income - expenses;
      const savingsRate = income > 0 ? (savings / income) * 100 : 0;

      comparisons.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        savings,
        savingsRate: Math.round(savingsRate * 10) / 10,
      });
    }

    return comparisons;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

