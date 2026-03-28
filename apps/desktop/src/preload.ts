import { contextBridge } from "electron";

// Expose minimal platform interface safely via contextBridge
contextBridge.exposeInMainWorld("electron", {
  platform: process.platform,
  // Add other required APIs here in the future
});
