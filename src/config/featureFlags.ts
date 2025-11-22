/**
 * Feature Flags Configuration
 * Use this file to enable/disable features in the app
 */

export const FEATURE_FLAGS = {
  VOICE_RECOGNITION: false, // Set to true to enable voice recognition feature
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

