/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import AddExpense from './src/screens/AddExpense';
import ExpensesList from './src/screens/ExpensesList';
import Settings from './src/screens/Settings';
import Reports from './src/screens/Reports';
import FAQ from './src/screens/FAQ';
import About from './src/screens/About';
import PrivacyPolicy from './src/screens/PrivacyPolicy';
import ManageCategories from './src/screens/ManageCategories';
import { ExpenseProvider } from './src/context/ExpenseContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ExpensesStack() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="ExpensesList"
        component={ExpensesList}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpense}
        options={{
          title: t('add.title'),
        }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={Settings}
        options={{
          title: t('settings.title'),
        }}
      />
      <Stack.Screen
        name="ManageCategories"
        component={ManageCategories}
        options={{
          title: t('categories.title'),
        }}
      />
      <Stack.Screen
        name="FAQ"
        component={FAQ}
        options={{
          title: t('settings.faq'),
        }}
      />
      <Stack.Screen
        name="About"
        component={About}
        options={{
          title: t('settings.about'),
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{
          title: t('settings.privacy'),
        }}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { t } = useLanguage();
  const { colors, theme } = useTheme();

  return (
    <ExpenseProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.textSecondary,
              tabBarStyle: {
                paddingBottom: 8,
                paddingTop: 8,
                height: 65,
                backgroundColor: colors.card,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                elevation: 8,
                shadowColor: colors.shadow,
                shadowOffset: {
                  width: 0,
                  height: -2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                marginTop: 4,
              },
            }}
          >
            <Tab.Screen
              name="Expenses"
              component={ExpensesStack}
              options={{
                tabBarLabel: t('nav.transactions'),
                tabBarIcon: ({ color, focused }) => (
                  <Icon
                    name={focused ? 'receipt' : 'receipt-outline'}
                    size={focused ? 26 : 24}
                    color={color}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Reports"
              component={Reports}
              options={{
                tabBarLabel: t('nav.reports'),
                tabBarIcon: ({ color, focused }) => (
                  <Icon
                    name={focused ? 'bar-chart' : 'bar-chart-outline'}
                    size={focused ? 26 : 24}
                    color={color}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsStack}
              options={{
                tabBarLabel: t('nav.settings'),
                tabBarIcon: ({ color, focused }) => (
                  <Icon
                    name={focused ? 'settings' : 'settings-outline'}
                    size={focused ? 26 : 24}
                    color={color}
                  />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ExpenseProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
