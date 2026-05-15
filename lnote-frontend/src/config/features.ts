const truthyValues = new Set(['1', 'true', 'yes', 'on']);

export function isFeatureEnabled(value: string | undefined): boolean {
  return truthyValues.has(String(value ?? '').trim().toLowerCase());
}

export const features = {
  pushNotifications: isFeatureEnabled(process.env.EXPO_PUBLIC_ENABLE_PUSH),
  ocr: isFeatureEnabled(process.env.EXPO_PUBLIC_ENABLE_OCR),
};
