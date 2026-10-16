export type Direction = 'rtl' | 'ltr'

declare module 'claude-code' {
  interface PluginState {
    'rtl-text': { isOn: boolean }
  }
}
