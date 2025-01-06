import { BrowserWindow } from "electron";
import EventEmitter from "events";
import path from "path";

export class BrowserWindowHost extends EventEmitter {
  mainWindow: BrowserWindow | null = null;

  open(options: {create: Boolean} = {create: true}) {
    this.getBrowserWindow(options);
  }

  getBrowserWindow(options: {create: Boolean} = {create: true}): BrowserWindow | null {
    if (!this.mainWindow) {
      if (options.create) {
        this.mainWindow = this.createBrowserWindow(options);
      }
    }
    return this.mainWindow;
  }

  private createBrowserWindow(options: {}) {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "chat.js"),
      },
      ...options
    });

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/chat.html`);
    } else {
      mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/chat.html`),
      );
    }

    // // cache the window
    // const id = mainWindow.id;
    // this.mainWindow = mainWindow;
    // messenger connect to the window
    // this.messenger.setChatChannel(
    //   peerToken,
    //   new WebviewChannel(peerToken, mainWindow.webContents),
    // );

    this.emit("create", mainWindow)

    // Clear the cache when the window is closed.
    mainWindow.on("close", (e) => {
      this.emit("close", mainWindow)
      this.mainWindow = null
    });

    // Open the DevTools.
    if (process.env.NODE_ENV === "development") {
      mainWindow.webContents.openDevTools();
    }
    // mainWindow.webContents.openDevTools();
    return mainWindow;
  }
}