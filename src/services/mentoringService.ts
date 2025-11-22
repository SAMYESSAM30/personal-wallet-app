/**
 * Mentoring Service
 * Provides financial advice and tips based on user's spending patterns
 */

import { Transaction } from '../types/expense';
import { CategoryInsight, FinancialHealth } from './analyticsService';

export interface FinancialTip {
  id: string;
  title: string;
  description: string;
  category: 'saving' | 'spending' | 'budgeting' | 'investment' | 'general';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export interface BudgetRecommendation {
  category: string;
  currentSpending: number;
  recommendedBudget: number;
  reason: string;
}

class MentoringService {
  /**
   * Generate personalized financial tips
   */
  generateTips(
    transactions: Transaction[],
    totalIncome: number,
    totalExpenses: number,
    financialHealth: FinancialHealth,
    categoryInsights: CategoryInsight[]
  ): FinancialTip[] {
    const tips: FinancialTip[] = [];

    // Savings rate tips
    const savingsRate = totalIncome > 0 
      ? ((totalIncome - totalExpenses) / totalIncome) * 100 
      : 0;

    if (savingsRate < 0) {
      tips.push({
        id: 'tip-1',
        title: 'Reduce Overspending',
        description: 'You are spending more than you earn. Create a budget and stick to it. Consider cutting non-essential expenses.',
        category: 'budgeting',
        priority: 'high',
        actionable: true,
      });
    } else if (savingsRate < 10) {
      tips.push({
        id: 'tip-2',
        title: 'Increase Savings Rate',
        description: 'Aim to save at least 10-20% of your income. Start by saving small amounts regularly.',
        category: 'saving',
        priority: 'high',
        actionable: true,
      });
    }

    // Category-specific tips
    const topSpendingCategory = categoryInsights[0];
    if (topSpendingCategory && topSpendingCategory.percentage > 40) {
      tips.push({
        id: 'tip-3',
        title: `Review ${topSpendingCategory.category} Spending`,
        description: `You're spending ${Math.round(topSpendingCategory.percentage)}% of your budget on ${topSpendingCategory.category}. Consider if this aligns with your priorities.`,
        category: 'spending',
        priority: 'medium',
        actionable: true,
      });
    }

    // Trend-based tips
    const increasingCategories = categoryInsights.filter(c => c.trend === 'increasing');
    if (increasingCategories.length > 0) {
      tips.push({
        id: 'tip-4',
        title: 'Monitor Increasing Expenses',
        description: `Your spending on ${increasingCategories.map(c => c.category).join(', ')} is increasing. Review these categories to ensure they're necessary.`,
        category: 'spending',
        priority: 'medium',
        actionable: true,
      });
    }

    // Transaction frequency tips
    if (transactions.length < 10) {
      tips.push({
        id: 'tip-5',
        title: 'Track More Transactions',
        description: 'Tracking more transactions helps you understand your spending patterns better. Try to log all expenses.',
        category: 'budgeting',
        priority: 'low',
        actionable: true,
      });
    }

    // Emergency fund tip
    if (savingsRate > 20) {
      tips.push({
        id: 'tip-6',
        title: 'Build Emergency Fund',
        description: 'Great savings rate! Consider building an emergency fund covering 3-6 months of expenses.',
        category: 'saving',
        priority: 'medium',
        actionable: true,
      });
    }

    // General tips
    tips.push({
      id: 'tip-7',
      title: 'Review Monthly Reports',
      description: 'Regularly review your spending reports to identify trends and areas for improvement.',
      category: 'general',
      priority: 'low',
      actionable: true,
    });

    if (totalIncome > 0 && totalExpenses / totalIncome < 0.7) {
      tips.push({
        id: 'tip-8',
        title: 'Consider Investments',
        description: 'You have a good savings rate. Consider investing your savings to grow your wealth over time.',
        category: 'investment',
        priority: 'low',
        actionable: false,
      });
    }

    return tips.slice(0, 5); // Return top 5 tips
  }

  /**
   * Generate budget recommendations
   */
  generateBudgetRecommendations(
    transactions: Transaction[],
    totalIncome: number,
    categoryInsights: CategoryInsight[]
  ): BudgetRecommendation[] {
    const recommendations: BudgetRecommendation[] = [];

    // 50/30/20 rule: 50% needs, 30% wants, 30% savings
    const needsCategories = ['فواتير', 'صحة', 'مواصلات'];
    const wantsCategories = ['ترفيه', 'تسوق', 'ملابس'];

    categoryInsights.forEach(insight => {
      const isNeed = needsCategories.includes(insight.category);
      const isWant = wantsCategories.includes(insight.category);

      if (isNeed) {
        const recommended = totalIncome * 0.5 * (insight.percentage / 100);
        if (insight.totalAmount > recommended * 1.2) {
          recommendations.push({
            category: insight.category,
            currentSpending: insight.totalAmount,
            recommendedBudget: recommended,
            reason: 'Needs should not exceed 50% of income. Consider reducing this category.',
          });
        }
      } else if (isWant) {
        const recommended = totalIncome * 0.3 * (insight.percentage / 100);
        if (insight.totalAmount > recommended * 1.2) {
          recommendations.push({
            category: insight.category,
            currentSpending: insight.totalAmount,
            recommendedBudget: recommended,
            reason: 'Wants should not exceed 30% of income. Try to reduce discretionary spending.',
          });
        }
      }
    });

    return recommendations;
  }

  /**
   * Get motivational message based on financial health
   */
  getMotivationalMessage(financialHealth: FinancialHealth, language: 'ar' | 'en'): string {
    const isArabic = language === 'ar';

    switch (financialHealth.status) {
      case 'excellent':
        return isArabic
          ? 'ممتاز! أنت تدير أموالك بشكل رائع. استمر في هذا النهج!'
          : 'Excellent! You are managing your finances very well. Keep it up!';
      
      case 'good':
        return isArabic
          ? 'جيد! أنت على الطريق الصحيح. يمكنك تحسين الوضع أكثر.'
          : 'Good! You are on the right track. You can improve further.';
      
      case 'fair':
        return isArabic
          ? 'لا بأس، لكن هناك مجال للتحسين. راجع مصروفاتك وابدأ في التوفير.'
          : 'Not bad, but there is room for improvement. Review your expenses and start saving.';
      
      case 'poor':
        return isArabic
          ? 'يحتاج وضعك المالي إلى تحسين. ابدأ بإنشاء ميزانية والتزم بها.'
          : 'Your financial situation needs improvement. Start by creating a budget and sticking to it.';
      
      default:
        return isArabic
          ? 'ابدأ بتتبع مصروفاتك للحصول على رؤى أفضل.'
          : 'Start tracking your expenses to get better insights.';
    }
  }
}

// Export singleton instance
export const mentoringService = new MentoringService();

