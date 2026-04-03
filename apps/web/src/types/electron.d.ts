export interface ElectronAPI {
  platform: string;
  onNoteNew: (callback: () => void) => () => void;
  onNoteDelete: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
