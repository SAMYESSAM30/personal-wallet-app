# إعداد Expo لتشغيل التطبيق على الموبايل

## ملاحظة مهمة
هذا المشروع يستخدم مكتبات Native Modules مثل:
- `@react-native-voice/voice` (للتعرف على الصوت)
- `react-native-vector-icons` (للأيقونات)

هذه المكتبات **لا تعمل مع Expo Go العادي** وتحتاج إلى **Expo Development Build**.

## الطريقة الأولى: استخدام Expo Development Build (موصى به)

### الخطوات:

1. **تثبيت Expo CLI** (إذا لم يكن مثبتاً):
   ```bash
   npm install -g expo-cli
   ```

2. **تشغيل Expo Development Server**:
   ```bash
   npm run expo
   ```
   أو
   ```bash
   npx expo start --dev-client
   ```

3. **بناء Development Build**:
   - للـ iOS: `npx expo run:ios`
   - للـ Android: `npx expo run:android`

4. **تشغيل على الموبايل**:
   - بعد بناء التطبيق، سيتم تثبيته على جهازك
   - افتح التطبيق وستجد QR Code في Terminal
   - امسح QR Code من داخل التطبيق

## الطريقة الثانية: استخدام React Native CLI (الأسهل)

إذا كنت تريد تشغيله مباشرة على الموبايل بدون Expo:

### للـ iOS:
```bash
npm run ios
```

### للـ Android:
1. تأكد من تفعيل Developer Mode و USB Debugging على الموبايل
2. وصّل الموبايل بالكمبيوتر
3. شغّل:
```bash
npm run android
```

## الطريقة الثالثة: استخدام Expo Go (محدود)

**تحذير**: بعض الميزات قد لا تعمل لأنها تحتاج native modules.

```bash
npm run expo
```

ثم امسح QR Code من تطبيق Expo Go على الموبايل.

## نصائح:
- تأكد من أن الموبايل والكمبيوتر على نفس الشبكة (WiFi)
- للـ iOS، قد تحتاج إلى Apple Developer Account
- للـ Android، تأكد من تفعيل USB Debugging

