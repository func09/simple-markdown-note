import { contextBridge, ipcRenderer } from "electron";

// Expose minimal platform interface safely via contextBridge
contextBridge.exposeInMainWorld("electron", {
  platform: process.platform,
  onNoteNew: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on("menu:note-new", listener);
    return () => {
      ipcRenderer.removeListener("menu:note-new", listener);
    };
  },
  onNoteDelete: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on("menu:note-delete", listener);
    return () => {
      ipcRenderer.removeListener("menu:note-delete", listener);
    };
  },
});
