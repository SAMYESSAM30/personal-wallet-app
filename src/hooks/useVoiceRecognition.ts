import { useState, useEffect, useRef } from 'react';
import Voice from '@react-native-voice/voice';
import { Alert } from 'react-native';

interface VoiceRecognitionResult {
  text: string;
  isListening: boolean;
  error: string | null;
}

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Setup voice recognition handlers
    Voice.onSpeechStart = () => {
      setIsListening(true);
      setError(null);
    };

    Voice.onSpeechEnd = () => {
      setIsListening(false);
    };

    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        setText(e.value[0]);
      }
    };

    Voice.onSpeechError = (e) => {
      setError(e.error?.message || 'حدث خطأ في التعرف على الصوت');
      setIsListening(false);
    };

    Voice.onSpeechPartialResults = (e) => {
      if (e.value && e.value.length > 0) {
        setText(e.value[0]);
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
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

