// client/src/types/electron.d.ts
declare global {
  interface Window {
    electronAPI?: {
      isElectron: true
      getPort: () => Promise<number>
      getUserDataPath: () => Promise<string>
      selectDirectory: () => Promise<string | null>
      selectFile: (filters?: Array<{ name: string; extensions: string[] }>) => Promise<string | null>
      quitApp: () => Promise<void>
      platform: string
    }
  }
}

export {}
