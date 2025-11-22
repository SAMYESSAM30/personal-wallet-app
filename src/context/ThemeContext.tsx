import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  error: string;
  success: string;
  border: string;
  card: string;
  shadow: string;
}

const lightTheme: ThemeColors = {
  background: '#FFFFFF', // الأبيض - اللون الأساسي
  surface: '#FFFFFF',
  text: '#1A1A1A', // الأسود الفاتح - اللون الثانوي
  textSecondary: '#4A4A4A', // رمادي داكن
  primary: '#1A1A1A', // الأسود الفاتح للعناصر الأساسية
  secondary: '#666666',
  error: '#1A1A1A',
  success: '#1A1A1A',
  border: '#E0E0E0', // رمادي فاتح للحدود
  card: '#FFFFFF',
  shadow: '#000000',
};

const darkTheme: ThemeColors = {
  background: '#000000', // الأسود - اللون الأساسي
  surface: '#000000',
  text: '#FFFFFF', // الأبيض - اللون الثانوي
  textSecondary: '#CCCCCC', // رمادي فاتح
  primary: '#FFFFFF', // الأبيض للعناصر الأساسية
  secondary: '#999999',
  error: '#FFFFFF',
  success: '#FFFFFF',
  border: '#333333', // رمادي داكن للحدود
  card: '#000000',
  shadow: '#000000',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@expense_app_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemTheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(systemTheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

