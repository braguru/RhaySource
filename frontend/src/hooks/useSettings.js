import { useSettingsContext } from '../context/SettingsContext';

/**
 * useSettings - Hook for real-time global configuration access.
 * Consumes the SettingsContext to provide instant updates for
 * branding, commerce, and broadcasts.
 */
export function useSettings() {
  const { settings, loading } = useSettingsContext();
  return { settings, loading };
}
