import { Settings } from './settings.model';
import { UpdateSettingsInput } from '@rental/shared';

/**
 * Settings Service
 * Business logic for agency settings (singleton).
 */
export const SettingsService = {
  /**
   * Get the unique settings document (auto-creates with defaults if absent).
   */
  getSettings: async () => {
    return Settings.getSettings();
  },

  /**
   * Update the unique settings document.
   */
  updateSettings: async (data: UpdateSettingsInput) => {
    const settings = await Settings.getSettings();
    settings.agencyName = data.agencyName;
    settings.defaultCurrency = data.defaultCurrency;
    settings.cancellationPolicy = data.cancellationPolicy;
    await settings.save();
    return settings;
  },
};
