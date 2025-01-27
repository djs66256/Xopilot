import { BrowserWindow } from "electron";
import EventEmitter from "node:events";
import path from "node:path";
import { WebviewChannel } from "../messages/WebviewChannel";
import { Project } from "./types";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

export type BrowserWindowHostEvents = {
  "create": BrowserWindow,
  "close": BrowserWindow
}

export declare interface BrowserWindowHost {
  on<T extends keyof BrowserWindowHostEvents>(event: T, listener: (arg: BrowserWindowHostEvents[T]) => void): this;
  emit<T extends keyof BrowserWindowHostEvents>(event: T, arg: BrowserWindowHostEvents[T]): boolean;
}

export class BrowserWindowHost extends EventEmitter {
  mainWindow: BrowserWindow | null = null;

  messageChannel: WebviewChannel

  constructor(readonly project: Project) {
    super();
    
    this.messageChannel = new WebviewChannel(project)

    this.on("create", (window) => {
      this.messageChannel.webview = window.webContents;
    });

    this.on("close", (window) => {
      this.messageChannel.webview = null;
    });
  }

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

    mainWindow.webContents.executeJavaScript(
      `window.XIPC_PROJECT = ${JSON.stringify(this.project)}`
    )

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/chat.html`);
    } else {
      mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/chat.html`),
      );
    }

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