import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicy() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>سياسة الخصوصية</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. جمع المعلومات</Text>
          <Text style={styles.text}>
            نحن نجمع المعلومات التي تدخلها في التطبيق فقط، مثل المصروفات والمدخلات والفئات. لا نجمع أي معلومات شخصية أخرى.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. استخدام المعلومات</Text>
          <Text style={styles.text}>
            نستخدم المعلومات التي تجمعها فقط لتوفير خدمات التطبيق لك، مثل عرض المصروفات والمدخلات وحساب الإحصائيات.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. تخزين البيانات</Text>
          <Text style={styles.text}>
            جميع بياناتك محفوظة محلياً على جهازك فقط. لا نرسل أي بيانات إلى خوادم خارجية أو أطراف ثالثة.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. الأمان</Text>
          <Text style={styles.text}>
            نحن نستخدم تقنيات التخزين المحلي الآمنة لحماية بياناتك. ومع ذلك، ننصحك بعدم مشاركة جهازك مع أشخاص آخرين.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. حذف البيانات</Text>
          <Text style={styles.text}>
            يمكنك حذف جميع بياناتك في أي وقت من خلال صفحة الإعدادات. عند حذف التطبيق، سيتم حذف جميع البيانات المحفوظة.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. التغييرات على السياسة</Text>
          <Text style={styles.text}>
            قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سيتم إعلامك بأي تغييرات مهمة.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. الاتصال بنا</Text>
          <Text style={styles.text}>
            إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى الاتصال بنا من خلال التطبيق.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right',
  },
  text: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
    textAlign: 'right',
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

