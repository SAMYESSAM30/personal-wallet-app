import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpenses } from '../context/ExpenseContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Currency, CURRENCIES } from '../types/expense';

export default function Settings() {
  const navigation = useNavigation();
  const { t, language, setLanguage } = useLanguage();
  const { theme, colors, setTheme } = useTheme();
  const {
    transactions,
    clearAllTransactions,
    totalExpenses,
    totalIncome,
    balance,
    currency,
    setCurrency,
    formatAmount,
    exportToEmail,
    monthlyResetEnabled,
    setMonthlyResetEnabled,
    syncEnabled,
    syncStatus,
    enableSync,
    disableSync,
    syncNow,
    shareData,
  } = useExpenses();

  const handleClearAll = () => {
    if (transactions.length === 0) {
      Alert.alert(t('settings.noTransactions'), t('settings.noTransactions'));
      return;
    }

    Alert.alert(
      t('settings.deleteAll'),
      t('settings.deleteAllConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            clearAllTransactions();
            Alert.alert(t('add.success'), t('settings.deleteAllSuccess'));
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    if (transactions.length === 0) {
      Alert.alert(t('settings.noTransactionsExport'), t('settings.noTransactionsExport'));
      return;
    }

    try {
      await exportToEmail();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Export failed');
    }
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
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 15,
      textAlign: 'right',
    },
    currencyCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    currencyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 10,
      marginBottom: 8,
      backgroundColor: theme === 'dark' ? '#2A2A2A' : '#F5F5F5',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    currencyButtonSelected: {
      backgroundColor: theme === 'dark' ? '#1E3A1E' : '#E8F5E9',
      borderColor: colors.primary,
    },
    currencyCode: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textSecondary,
      marginRight: 12,
      minWidth: 50,
    },
    currencyCodeSelected: {
      color: colors.primary,
    },
    currencyName: {
      flex: 1,
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'right',
    },
    currencyNameSelected: {
      color: colors.text,
      fontWeight: '600',
    },
    statCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'right',
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    menuItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    menuItemText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'right',
    },
    actionButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 3,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    dangerButton: {
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.error,
    },
    dangerButtonText: {
      color: colors.error,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>{t('settings.title')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.language')}</Text>
          <View style={dynamicStyles.currencyCard}>
            {(['ar', 'en'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  dynamicStyles.currencyButton,
                  language === lang && dynamicStyles.currencyButtonSelected,
                ]}
                onPress={() => setLanguage(lang)}
              >
                <Text
                  style={[
                    dynamicStyles.currencyCode,
                    language === lang && dynamicStyles.currencyCodeSelected,
                  ]}
                >
                  {lang === 'ar' ? 'AR' : 'EN'}
                </Text>
                <Text
                  style={[
                    dynamicStyles.currencyName,
                    language === lang && dynamicStyles.currencyNameSelected,
                  ]}
                >
                  {lang === 'ar' ? 'العربية' : 'English'}
                </Text>
                {language === lang && (
                  <Icon name="checkmark-circle" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.theme')}</Text>
          <View style={dynamicStyles.currencyCard}>
            {(['light', 'dark'] as const).map((th) => (
              <TouchableOpacity
                key={th}
                style={[
                  dynamicStyles.currencyButton,
                  theme === th && dynamicStyles.currencyButtonSelected,
                ]}
                onPress={() => setTheme(th)}
              >
                <Icon
                  name={th === 'dark' ? 'moon' : 'sunny'}
                  size={20}
                  color={theme === th ? colors.primary : colors.textSecondary}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    dynamicStyles.currencyName,
                    theme === th && dynamicStyles.currencyNameSelected,
                  ]}
                >
                  {th === 'dark' ? (language === 'ar' ? 'داكن' : 'Dark') : (language === 'ar' ? 'فاتح' : 'Light')}
                </Text>
                {theme === th && (
                  <Icon name="checkmark-circle" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.currency')}</Text>
          <View style={dynamicStyles.currencyCard}>
            {Object.values(CURRENCIES).map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  dynamicStyles.currencyButton,
                  currency === curr.code && dynamicStyles.currencyButtonSelected,
                ]}
                onPress={() => setCurrency(curr.code)}
              >
                <Text
                  style={[
                    dynamicStyles.currencyCode,
                    currency === curr.code && dynamicStyles.currencyCodeSelected,
                  ]}
                >
                  {curr.code}
                </Text>
                <Text
                  style={[
                    dynamicStyles.currencyName,
                    currency === curr.code && dynamicStyles.currencyNameSelected,
                  ]}
                >
                  {curr.name}
                </Text>
                {currency === curr.code && (
                  <Icon name="checkmark-circle" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.statistics')}</Text>
          <View style={dynamicStyles.statCard}>
            <View style={dynamicStyles.statRow}>
              <Text style={dynamicStyles.statLabel}>{t('settings.totalTransactions')}</Text>
              <Text style={dynamicStyles.statValue}>{transactions.length}</Text>
            </View>
            <View style={dynamicStyles.statRow}>
              <Text style={dynamicStyles.statLabel}>{t('settings.totalIncome')}</Text>
              <Text style={[dynamicStyles.statValue, { color: colors.success }]}>
                +{formatAmount(totalIncome)}
              </Text>
            </View>
            <View style={dynamicStyles.statRow}>
              <Text style={dynamicStyles.statLabel}>{t('settings.totalExpenses')}</Text>
              <Text style={[dynamicStyles.statValue, { color: colors.error }]}>
                -{formatAmount(totalExpenses)}
              </Text>
            </View>
            <View style={[dynamicStyles.statRow, styles.balanceRow, { borderTopColor: colors.border }]}>
              <Text style={dynamicStyles.statLabel}>{t('settings.currentBalance')}</Text>
              <Text style={[dynamicStyles.statValue, { color: balance >= 0 ? colors.success : colors.error }]}>
                {balance >= 0 ? '+' : ''} {formatAmount(Math.abs(balance))}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.title')}</Text>
          <TouchableOpacity
            style={dynamicStyles.menuItem}
            onPress={() => navigation.navigate('ManageCategories' as never)}
          >
            <Text style={dynamicStyles.menuItemText}>{t('settings.manageCategories')}</Text>
            <Icon name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>{language === 'ar' ? 'الإعدادات المتقدمة' : 'Advanced Settings'}</Text>
          <View style={dynamicStyles.currencyCard}>
            <TouchableOpacity
              style={[
                dynamicStyles.menuItem,
                { marginBottom: 0, backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 }
              ]}
              onPress={() => {
                if (!monthlyResetEnabled) {
                  Alert.alert(
                    t('settings.monthlyReset'),
                    t('settings.monthlyResetConfirm'),
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: t('common.save'),
                        onPress: () => setMonthlyResetEnabled(true),
                      },
                    ]
                  );
                } else {
                  setMonthlyResetEnabled(false);
                }
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={dynamicStyles.menuItemText}>{t('settings.monthlyReset')}</Text>
                <Text style={[dynamicStyles.statLabel, { fontSize: 12, marginTop: 4 }]}>
                  {t('settings.monthlyResetDesc')}
                </Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: monthlyResetEnabled ? colors.primary : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      transform: [{ translateX: monthlyResetEnabled ? 20 : 0 }],
                      backgroundColor: '#FFFFFF',
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>

            {/* Sync Settings */}
            <TouchableOpacity
              style={[
                dynamicStyles.menuItem,
                { marginBottom: 0, backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 }
              ]}
              onPress={async () => {
                if (!syncEnabled) {
                  Alert.alert(
                    t('settings.sync'),
                    t('settings.syncConfirm'),
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: t('common.save'),
                        onPress: async () => {
                          try {
                            await enableSync();
                            Alert.alert(t('add.success'), t('settings.syncEnabled'));
                          } catch (error: any) {
                            Alert.alert(t('common.error'), error.message || t('settings.syncError'));
                          }
                        },
                      },
                    ]
                  );
                } else {
                  Alert.alert(
                    t('settings.sync'),
                    t('settings.syncDisableConfirm'),
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: t('common.save'),
                        onPress: async () => {
                          try {
                            await disableSync();
                            Alert.alert(t('add.success'), t('settings.syncDisabled'));
                          } catch (error: any) {
                            Alert.alert(t('common.error'), error.message || t('settings.syncError'));
                          }
                        },
                      },
                    ]
                  );
                }
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={dynamicStyles.menuItemText}>{t('settings.sync')}</Text>
                <Text style={[dynamicStyles.statLabel, { fontSize: 12, marginTop: 4 }]}>
                  {t('settings.syncDesc')}
                </Text>
                {syncStatus.lastSyncTime && (
                  <Text style={[dynamicStyles.statLabel, { fontSize: 11, marginTop: 2, color: colors.textSecondary }]}>
                    {language === 'ar' 
                      ? `آخر مزامنة: ${syncStatus.lastSyncTime.toLocaleString('ar-SA')}`
                      : `Last sync: ${syncStatus.lastSyncTime.toLocaleString('en-US')}`}
                  </Text>
                )}
                {syncStatus.error && (
                  <Text style={[dynamicStyles.statLabel, { fontSize: 11, marginTop: 2, color: colors.error }]}>
                    {syncStatus.error}
                  </Text>
                )}
              </View>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: syncEnabled ? colors.primary : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      transform: [{ translateX: syncEnabled ? 20 : 0 }],
                      backgroundColor: '#FFFFFF',
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>

            {/* Sync Now Button */}
            {syncEnabled && (
              <TouchableOpacity
                style={[
                  dynamicStyles.actionButton,
                  { marginTop: 12, backgroundColor: syncStatus.isSyncing ? colors.border : colors.primary }
                ]}
                onPress={async () => {
                  try {
                    await syncNow();
                    Alert.alert(t('add.success'), t('settings.syncSuccess'));
                  } catch (error: any) {
                    Alert.alert(t('common.error'), error.message || t('settings.syncError'));
                  }
                }}
                disabled={syncStatus.isSyncing}
              >
                {syncStatus.isSyncing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={dynamicStyles.actionButtonText}>{t('settings.syncNow')}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.shareAndExport')}</Text>
          <TouchableOpacity 
            style={dynamicStyles.actionButton} 
            onPress={handleExport}
          >
            <Icon name="mail-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={dynamicStyles.actionButtonText}>{t('settings.export')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[dynamicStyles.actionButton, { backgroundColor: colors.success }]} 
            onPress={async () => {
              if (transactions.length === 0) {
                Alert.alert(t('settings.noTransactionsExport'), t('settings.noTransactionsExport'));
                return;
              }
              try {
                await shareData('text', language);
              } catch (error: any) {
                Alert.alert(t('common.error'), error.message || t('settings.shareError'));
              }
            }}
          >
            <Icon name="share-social-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={dynamicStyles.actionButtonText}>{t('settings.shareText')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.actionButton, { backgroundColor: colors.primary }]} 
            onPress={async () => {
              if (transactions.length === 0) {
                Alert.alert(t('settings.noTransactionsExport'), t('settings.noTransactionsExport'));
                return;
              }
              try {
                await shareData('csv', language);
              } catch (error: any) {
                Alert.alert(t('common.error'), error.message || t('settings.shareError'));
              }
            }}
          >
            <Icon name="document-text-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={dynamicStyles.actionButtonText}>{t('settings.shareCSV')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[dynamicStyles.actionButton, { backgroundColor: colors.primary }]} 
            onPress={async () => {
              if (transactions.length === 0) {
                Alert.alert(t('settings.noTransactionsExport'), t('settings.noTransactionsExport'));
                return;
              }
              try {
                await shareData('json', language);
              } catch (error: any) {
                Alert.alert(t('common.error'), error.message || t('settings.shareError'));
              }
            }}
          >
            <Icon name="code-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={dynamicStyles.actionButtonText}>{t('settings.shareJSON')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.actions')}</Text>
          <TouchableOpacity
            style={[dynamicStyles.actionButton, dynamicStyles.dangerButton]}
            onPress={handleClearAll}
          >
            <Text style={[dynamicStyles.actionButtonText, dynamicStyles.dangerButtonText]}>
              {t('settings.deleteAll')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.information')}</Text>
          <TouchableOpacity
            style={dynamicStyles.menuItem}
            onPress={() => navigation.navigate('FAQ' as never)}
          >
            <Text style={dynamicStyles.menuItemText}>{t('settings.faq')}</Text>
            <Icon name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={dynamicStyles.menuItem}
            onPress={() => navigation.navigate('About' as never)}
          >
            <Text style={dynamicStyles.menuItemText}>{t('settings.about')}</Text>
            <Icon name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={dynamicStyles.menuItem}
            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
          >
            <Text style={dynamicStyles.menuItemText}>{t('settings.privacy')}</Text>
            <Icon name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
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
  section: {
    marginBottom: 30,
  },
  balanceRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
