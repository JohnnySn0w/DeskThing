import { create } from 'zustand'
import { Settings } from '@shared/types'

interface SettingsStoreState {
  settings: Settings
  getSettings: () => Promise<Settings>
  requestSettings: () => Promise<Settings>
  getSetting: (key: keyof Settings) => Settings[keyof Settings]
  saveSettings: (settings: Settings) => void
  savePartialSettings: (settings: Partial<Settings>) => void
  setSettings: (settings: Settings) => void
}

const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  settings: {
    version: '0.0.0',
    version_code: 0,
    callbackPort: -1,
    devicePort: -1,
    address: '-.-.-.-',
    autoStart: true,
    minimizeApp: true,
    autoConfig: false,
    globalADB: false,
    autoDetectADB: false,
    refreshInterval: -1,
    playbackLocation: undefined,
    localIp: ['-.-.-.-'],
    appRepos: ['https://github.com/ItsRiprod/deskthing-apps'],
    clientRepos: ['https://github.com/ItsRiprod/deskthing-client']
  },

  getSettings: async (): Promise<Settings> => {
    const state = get()
    if (state.settings.callbackPort === -1 || state.settings.devicePort === -1) {
      await get().requestSettings()
    }
    return state.settings
  },

  requestSettings: async (): Promise<Settings> => {
    const settings = await window.electron.getSettings()
    set(settings)
    return settings
  },

  getSetting: (key: keyof Settings): Settings[keyof Settings] => {
    return get().settings[key]
  },

  saveSettings: (settings: Settings): void => {
    set({ settings })
    window.electron.saveSettings(settings)
  },

  savePartialSettings: (settings: Partial<Settings>): void => {
    const currentSettings = get().settings
    const updatedSettings = { ...currentSettings, ...settings }
    set({ settings: updatedSettings })
    window.electron.saveSettings(updatedSettings)
  },

  setSettings: (settings: Settings): void => {
    set({ settings })
  }
}))

export default useSettingsStore
