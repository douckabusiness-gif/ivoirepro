export function normalizeGoogleAnalyticsId(value: unknown) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export function isValidGoogleAnalyticsId(value: unknown) {
  const id = normalizeGoogleAnalyticsId(value);
  return id === '' || /^G-[A-Z0-9]+$/.test(id);
}

