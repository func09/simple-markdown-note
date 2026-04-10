import * as os from "node:os";
import * as path from "node:path";
import { app, BrowserWindow } from "electron";
import { setupMenu } from "./menu";
import { APP_NAME } from "./types";

// Disable hardware acceleration to avoid some GPU-related glitches (optional, but good for simple apps)
// app.disableHardwareAcceleration();

let mainWindow: BrowserWindow | null;

const isDev = !app.isPackaged;

function resolveWindowIconPath(): string {
  if (isDev) {
    return path.resolve(__dirname, "../assets/icon.png");
  }

  return path.resolve(__dirname, "../renderer/icons/icon.png");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    icon: resolveWindowIconPath(),
    titleBarStyle: "hiddenInset", // macOS transparent titlebar + traffic lights
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true, // Allow devTools in production for convenience
    },
  });
  const releaseChannel = isDev ? "development" : "production";
  const desktopUserAgent = `${APP_NAME}/${app.getVersion()} (macos; ${os.release()}; ${releaseChannel})`;
  mainWindow.webContents.setUserAgent(desktopUserAgent);

  if (isDev) {
    // In development, load the Vite dev server
    mainWindow.loadURL("http://localhost:3000");
  } else {
    // In production, load the built index.html from the 'renderer' directory
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
