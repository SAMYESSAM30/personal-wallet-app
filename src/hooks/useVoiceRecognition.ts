import { useState, useEffect, useRef } from 'react';
import { Alert, NativeModules, Platform } from 'react-native';

// Conditional import - only import Voice if native module is available
// This prevents NativeEventEmitter initialization error
let Voice: any = null;
let VoiceNativeModule: any = null;
let VoiceImportAttempted = false;

// Check if Voice native module is available BEFORE importing
// This is critical because @react-native-voice/voice creates NativeEventEmitter
// which requires a non-null NativeModule
const checkVoiceAvailability = () => {
  try {
    // CRITICAL: Check if native module exists FIRST, before any import
    if (!VoiceNativeModule) {
      VoiceNativeModule = NativeModules.Voice;
      // Debug: Log available native modules
      if (__DEV__) {
        console.log('Available NativeModules:', Object.keys(NativeModules));
        console.log('Voice NativeModule:', VoiceNativeModule);
      }
    }
    
    // If native module doesn't exist, Voice is definitely not available
    // Don't even try to import the module
    if (!VoiceNativeModule || VoiceNativeModule === null || VoiceNativeModule === undefined) {
      if (__DEV__) {
        console.warn('Voice NativeModule is not available. Make sure the module is linked correctly.');
      }
      return false;
    }
    
    // Only import Voice if native module exists and we haven't tried before
    if (Voice === null && !VoiceImportAttempted && VoiceNativeModule) {
      VoiceImportAttempted = true;
      try {
        // Dynamic import using require - wrapped in try-catch
        // This prevents the module from being loaded if it causes errors
        // The module will try to create NativeEventEmitter(Voice), so Voice must exist
        const VoiceModule = require('@react-native-voice/voice');
        Voice = VoiceModule.default || VoiceModule;
        
        // Double check that Voice was loaded successfully
        if (!Voice) {
          return false;
        }
      } catch (importError: any) {
        // If import fails (e.g., NativeEventEmitter error), mark as unavailable
        console.warn('Failed to import Voice module:', importError?.message || importError);
        Voice = null;
        VoiceImportAttempted = false; // Allow retry
        return false;
      }
    }
    
    return Voice !== null && VoiceNativeModule !== null;
  } catch (e: any) {
    console.warn('Voice recognition not available:', e?.message || e);
    return false;
  }
};

interface VoiceRecognitionResult {
  text: string;
  isListening: boolean;
  error: string | null;
}

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check if Voice is available
    if (!checkVoiceAvailability()) {
      console.warn('Voice recognition module not available');
      setError('Voice recognition is not available');
      return;
    }

    // Setup voice recognition handlers with proper event handling
    const speechStartHandler = () => {
      setIsListening(true);
      setError(null);
    };

    const speechEndHandler = () => {
      setIsListening(false);
    };

    const speechResultsHandler = (e: any) => {
      if (e.value && e.value.length > 0) {
        setText(e.value[0]);
      }
    };

    const speechErrorHandler = (e: any) => {
      setError(e.error?.message || 'حدث خطأ في التعرف على الصوت');
      setIsListening(false);
    };

    const speechPartialResultsHandler = (e: any) => {
      if (e.value && e.value.length > 0) {
        setText(e.value[0]);
      }
    };

    // Use event listeners if available, otherwise fallback to direct assignment
    try {
      if (Voice && Voice.onSpeechStart !== undefined) {
        Voice.onSpeechStart = speechStartHandler;
        Voice.onSpeechEnd = speechEndHandler;
        Voice.onSpeechResults = speechResultsHandler;
        Voice.onSpeechError = speechErrorHandler;
        Voice.onSpeechPartialResults = speechPartialResultsHandler;
      }
    } catch (err) {
      console.warn('Error setting up voice handlers:', err);
    }

    return () => {
      if (Voice) {
        Voice.destroy().then(() => {
          if (Voice.removeAllListeners) {
            Voice.removeAllListeners();
          }
        }).catch(() => {});
      }
    };
  }, []);

  const startListening = async () => {
    if (!checkVoiceAvailability()) {
      setError('Voice recognition is not available');
      Alert.alert('خطأ', 'التعرف على الصوت غير متاح حالياً. يرجى التأكد من أن Native Module مربوط بشكل صحيح.');
      return;
    }
    
    try {
      setText('');
      setError(null);
      await Voice.start('ar-SA'); // Arabic language
      
      // Auto-stop after 10 seconds
      recognitionTimeout.current = setTimeout(() => {
        stopListening();
      }, 10000);
    } catch (err: any) {
      setError(err.message || 'فشل في بدء التعرف على الصوت');
      Alert.alert('خطأ', 'لا يمكن الوصول إلى الميكروفون. يرجى التحقق من الأذونات.');
    }
  };

  const stopListening = async () => {
    if (!Voice) return;
    
    try {
      if (recognitionTimeout.current) {
        clearTimeout(recognitionTimeout.current);
        recognitionTimeout.current = null;
      }
      await Voice.stop();
      setIsListening(false);
    } catch (err: any) {
      setError(err.message || 'فشل في إيقاف التعرف على الصوت');
    }
  };

  const cancelListening = async () => {
    if (!Voice) return;
    
    try {
      if (recognitionTimeout.current) {
        clearTimeout(recognitionTimeout.current);
        recognitionTimeout.current = null;
      }
      await Voice.cancel();
      setIsListening(false);
      setText('');
    } catch (err: any) {
      setError(err.message || 'فشل في إلغاء التعرف على الصوت');
    }
  };

  return {
    text,
    isListening,
    error,
    startListening,
    stopListening,
    cancelListening,
  };
}

