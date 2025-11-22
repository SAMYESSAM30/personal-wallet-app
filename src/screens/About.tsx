import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

export default function About() {
  const { colors, theme } = useTheme();

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
    section: {
      marginBottom: 25,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      alignItems: 'center',
      borderWidth: theme === 'dark' ? 1 : 0,
      borderColor: colors.border,
    },
    appName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    version: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'right',
      width: '100%',
    },
    text: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 24,
      textAlign: 'right',
      width: '100%',
    },
    featureItem: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 28,
      textAlign: 'right',
      marginBottom: 4,
    },
    footerText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>حول التطبيق</Text>
        </View>

        <View style={dynamicStyles.section}>
          <View style={[styles.appIcon, { backgroundColor: colors.primary }]}>
            <Icon name="wallet" size={40} color="#FFFFFF" />
          </View>
          <Text style={dynamicStyles.appName}>تطبيق إدارة المصروفات</Text>
          <Text style={dynamicStyles.version}>الإصدار 1.0.0</Text>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>الوصف</Text>
          <Text style={dynamicStyles.text}>
            تطبيق بسيط وسهل الاستخدام لإدارة مصروفاتك ومدخلاتك المالية. يساعدك على تتبع إنفاقك وإيراداتك بشكل منظم وفعال.
          </Text>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>المميزات</Text>
          <View style={styles.featuresList}>
            <Text style={dynamicStyles.featureItem}>• إضافة مصروفات ومدخلات بسهولة</Text>
            <Text style={dynamicStyles.featureItem}>• تصنيف المعاملات حسب الفئات</Text>
            <Text style={dynamicStyles.featureItem}>• دعم عملات متعددة</Text>
            <Text style={dynamicStyles.featureItem}>• عرض إحصائيات مفصلة</Text>
            <Text style={dynamicStyles.featureItem}>• إدارة الفئات المخصصة</Text>
            <Text style={dynamicStyles.featureItem}>• تصدير البيانات</Text>
          </View>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>المطور</Text>
          <Text style={dynamicStyles.text}>
            تم تطوير هذا التطبيق باستخدام React Native لضمان تجربة مستخدم سلسة على جميع الأجهزة.
          </Text>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>الدعم</Text>
          <Text style={dynamicStyles.text}>
            إذا كان لديك أي استفسارات أو اقتراحات، يرجى التواصل معنا من خلال صفحة الأسئلة الشائعة.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={dynamicStyles.footerText}>© 2024 جميع الحقوق محفوظة</Text>
        </View>
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
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuresList: {
    width: '100%',
    alignItems: 'flex-end',
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
});

