# Personal Wallet App 💰

A modern, feature-rich personal expense management mobile application built with React Native and Expo. Track your expenses, manage categories, generate reports, and analyze your spending patterns with an intuitive and beautiful interface.

## ✨ Features

- 📝 **Expense Management**: Add, edit, and delete expenses with ease
- 🎤 **Voice Recognition**: Add expenses using voice commands (powered by React Native Voice)
- 📊 **Reports & Analytics**: Visualize your spending with interactive charts and statistics
- 🏷️ **Category Management**: Organize expenses with customizable categories
- 🌍 **Multi-language Support**: Available in multiple languages
- 🌓 **Dark/Light Theme**: Beautiful UI with theme switching support
- 💾 **Local Storage**: All data stored locally using AsyncStorage
- 📱 **Cross-platform**: Works on both iOS and Android

## 🛠️ Tech Stack

- **React Native** 0.82.1
- **Expo** 54.0.25
- **TypeScript**
- **React Navigation** (Bottom Tabs & Stack Navigation)
- **React Native Voice** (Voice recognition)
- **React Native Chart Kit** (Charts and visualizations)
- **AsyncStorage** (Local data persistence)
- **React Native Vector Icons** (Icon library)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20
- **npm** or **yarn**
- **React Native development environment** set up
  - For iOS: Xcode (macOS only)
  - For Android: Android Studio
- **Expo CLI** (optional, for Expo workflow)

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SAMYESSAM30/personal-wallet-app.git
cd personal-wallet-app/MobileApp
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies (macOS only):
```bash
cd ios
pod install
cd ..
```

### Running the App

#### Using React Native CLI

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

#### Using Expo

**Start Expo development server:**
```bash
npm run expo
```

**Run on iOS:**
```bash
npm run expo:ios
```

**Run on Android:**
```bash
npm run expo:android
```

> **Note**: This project uses native modules (voice recognition, vector icons) that require **Expo Development Build**. Regular Expo Go may not support all features.

## 📱 Development Build Setup

Since this app uses native modules, you'll need to create a development build:

### iOS Development Build

```bash
npx expo run:ios
```

### Android Development Build

```bash
npx expo run:android
```

## 🏗️ Project Structure

```
MobileApp/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context providers
│   │   ├── ExpenseContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useVoiceRecognition.ts
│   ├── screens/          # Screen components
│   │   ├── AddExpense.tsx
│   │   ├── ExpensesList.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   └── ...
│   ├── types/           # TypeScript type definitions
│   │   └── expense.ts
│   └── utils/           # Utility functions
│       └── voiceParser.ts
├── ios/                  # iOS native code
├── android/              # Android native code
├── App.tsx              # Main app component
└── package.json         # Dependencies
```

## 🎨 Features in Detail

### Expense Management
- Add expenses with amount, category, date, and notes
- Edit and delete existing expenses
- Filter and search expenses
- Sort by date, amount, or category

### Voice Recognition
- Add expenses using natural language voice commands
- Supports multiple languages
- Automatic parsing of voice input

### Reports & Analytics
- Monthly and yearly expense summaries
- Category-wise spending breakdown
- Interactive charts and graphs
- Export capabilities

### Category Management
- Create custom expense categories
- Edit and delete categories
- Category icons and colors
- Default categories included

### Settings
- Language selection
- Theme switching (Light/Dark)
- Privacy policy
- About page
- FAQ section

## 🧪 Testing

Run tests:
```bash
npm test
```

## 📝 Scripts

- `npm start` - Start Metro bundler
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run expo` - Start Expo development server
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests

## 🔧 Troubleshooting

### Common Issues

**iOS Build Errors:**
- Make sure CocoaPods dependencies are installed: `cd ios && pod install`
- Clean build folder: `cd ios && rm -rf build && pod install`

**Metro Bundler Issues:**
- Clear cache: `npm start -- --reset-cache`
- Clear watchman: `watchman watch-del-all`

**Version Mismatch Errors:**
- Ensure React and React Native versions are compatible
- Delete `node_modules` and `package-lock.json`, then reinstall

## 📄 License

This project is private and proprietary.

## 👤 Author

**SAMYESSAM30**
- GitHub: [@SAMYESSAM30](https://github.com/SAMYESSAM30)

## 🙏 Acknowledgments

- React Native community
- Expo team
- All open-source contributors

---

Made with ❤️ using React Native
