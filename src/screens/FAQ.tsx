import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'كيف يمكنني إضافة مصروف جديد؟',
    answer: 'يمكنك إضافة مصروف جديد من خلال الضغط على زر "إضافة" في الشريط السفلي، ثم اختيار نوع المعاملة (مصروف أو مدخل)، وإدخال المبلغ والوصف والفئة.',
  },
  {
    question: 'كيف يمكنني حذف معاملة؟',
    answer: 'يمكنك حذف معاملة من خلال الضغط المطول على المعاملة في صفحة القائمة، ثم تأكيد الحذف.',
  },
  {
    question: 'كيف يمكنني تغيير العملة؟',
    answer: 'يمكنك تغيير العملة من صفحة الإعدادات، ثم اختيار العملة المفضلة من قائمة العملات المتاحة.',
  },
  {
    question: 'هل يمكنني إضافة فئات مخصصة؟',
    answer: 'نعم، يمكنك إضافة فئات مخصصة من صفحة الإعدادات > إدارة الفئات، ثم إضافة الفئة الجديدة.',
  },
  {
    question: 'كيف يمكنني تصدير بياناتي؟',
    answer: 'يمكنك تصدير بياناتك من صفحة الإعدادات > تصدير البيانات، ثم اختيار إرسالها إلى الإيميل.',
  },
  {
    question: 'هل بياناتي محفوظة محلياً؟',
    answer: 'نعم، جميع بياناتك محفوظة محلياً على جهازك ولا يتم إرسالها إلى أي خادم خارجي.',
  },
  {
    question: 'كيف يمكنني حذف جميع المعاملات؟',
    answer: 'يمكنك حذف جميع المعاملات من صفحة الإعدادات > حذف جميع المعاملات، مع التأكيد على أن هذا الإجراء لا يمكن التراجع عنه.',
  },
];

export default function FAQ() {
  const { colors, theme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    faqItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: theme === 'dark' ? 1 : 0,
      borderColor: colors.border,
    },
    question: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'right',
      marginRight: 12,
    },
    answer: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 22,
      textAlign: 'right',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>الأسئلة الشائعة</Text>
        </View>

        {faqData.map((item, index) => (
          <View key={index} style={dynamicStyles.faqItem}>
            <TouchableOpacity
              style={styles.questionContainer}
              onPress={() => toggleItem(index)}
              activeOpacity={0.7}
            >
              <Text style={dynamicStyles.question}>{item.question}</Text>
              <Icon
                name={expandedItems.has(index) ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
            {expandedItems.has(index) && (
              <View style={styles.answerContainer}>
                <Text style={dynamicStyles.answer}>{item.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});

