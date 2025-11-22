import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { TransactionType, CustomCategory } from '../types/expense';

const categoryColors = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#95E1D3',
  '#F38181',
  '#AA96DA',
  '#FCBAD3',
  '#C7CEEA',
  '#51CF66',
  '#74B9FF',
  '#A29BFE',
  '#FD79A8',
  '#FDCB6E',
];

export default function ManageCategories() {
  const { customCategories, addCustomCategory, deleteCustomCategory } = useExpenses();
  const { colors, theme } = useTheme();
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<TransactionType>('expense');
  const [selectedColor, setSelectedColor] = useState(categoryColors[0]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الفئة');
      return;
    }

    if (customCategories.some((cat) => cat.name === newCategoryName.trim() && cat.type === newCategoryType)) {
      Alert.alert('خطأ', 'هذه الفئة موجودة بالفعل');
      return;
    }

    addCustomCategory({
      name: newCategoryName.trim(),
      type: newCategoryType,
      color: selectedColor,
    });

    Alert.alert('نجح', 'تم إضافة الفئة بنجاح');
    setNewCategoryName('');
    setShowAddModal(false);
  };

  const handleDeleteCategory = (category: CustomCategory) => {
    Alert.alert(
      'حذف الفئة',
      `هل أنت متأكد من حذف فئة "${category.name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            deleteCustomCategory(category.id);
            Alert.alert('نجح', 'تم حذف الفئة');
          },
        },
      ]
    );
  };

  const expenseCategories = customCategories.filter((cat) => cat.type === 'expense');
  const incomeCategories = customCategories.filter((cat) => cat.type === 'income');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>إدارة الفئات</Text>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Icon name="add-circle" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          <Text style={styles.addButtonText}>{t('categories.addNew')}</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>فئات المصروفات المخصصة</Text>
          {expenseCategories.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>لا توجد فئات مخصصة</Text>
            </View>
          ) : (
            expenseCategories.map((category) => (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[styles.colorIndicator, { backgroundColor: category.color }]}
                  />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCategory(category)}
                >
                  <Icon name="trash-outline" size={18} color={colors.error} style={{ marginLeft: 6 }} />
                  <Text style={[styles.deleteButtonText, { color: colors.error }]}>{t('common.delete')}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>فئات المدخلات المخصصة</Text>
          {incomeCategories.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>لا توجد فئات مخصصة</Text>
            </View>
          ) : (
            incomeCategories.map((category) => (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[styles.colorIndicator, { backgroundColor: category.color }]}
                  />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCategory(category)}
                >
                  <Icon name="trash-outline" size={18} color={colors.error} style={{ marginLeft: 6 }} />
                  <Text style={[styles.deleteButtonText, { color: colors.error }]}>{t('common.delete')}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إضافة فئة جديدة</Text>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newCategoryType === 'expense' && styles.typeButtonActive,
                  { backgroundColor: newCategoryType === 'expense' ? '#FF6B6B' : '#F5F5F5' },
                ]}
                onPress={() => setNewCategoryType('expense')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    newCategoryType === 'expense' && styles.typeButtonTextActive,
                  ]}
                >
                  مصروف
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newCategoryType === 'income' && styles.typeButtonActive,
                  { backgroundColor: newCategoryType === 'income' ? '#51CF66' : '#F5F5F5' },
                ]}
                onPress={() => setNewCategoryType('income')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    newCategoryType === 'income' && styles.typeButtonTextActive,
                  ]}
                >
                  مدخل
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>اسم الفئة</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل اسم الفئة"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>اختر اللون</Text>
            <View style={styles.colorPicker}>
              {categoryColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Icon name="checkmark" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewCategoryName('');
                }}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddCategory}
              >
                <Text style={styles.saveButtonText}>حفظ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'right',
  },
  categoryItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
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
    marginBottom: 20,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

