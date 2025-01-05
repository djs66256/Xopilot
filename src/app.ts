import { BrowserWindow, ipcMain } from "electron";
import { SocketIPCServer } from "./core/ipc/SocketIPCServer";
import { XCodeMessenger } from "./core/ipc/XCodeMessenger";
import path from "path";
import { WebviewChannel } from "./core/ipc/MessageChannel";
import { PeerToken } from "./core/ipc/Message";

export class App {
  constructor(
    private messagenger = new XCodeMessenger(),
    private ipcServer = new SocketIPCServer(),
    private windows: Map<number, BrowserWindow> = new Map(),
    private peerTokens: Map<number, PeerToken> = new Map(),
  ) {
    this.ipcMainHandler = this.ipcMainHandler.bind(this);
  }

  start() {
    this.ipcServer.on("connected", (channel) => {
      this.messagenger.createChannel(channel);
    });
    this.ipcServer.on("disconnected", (channel) => {
      this.messagenger.destroyChannel(channel);
    });

    ipcMain.on("xipc/postToMain", this.ipcMainHandler);
  }

  stop() {
    this.messagenger.destroyAll();
    ipcMain.off("xipc/postToMain", this.ipcMainHandler);
  }

  // ipc handler for webview to main process
  private ipcMainHandler(
    event: Electron.IpcMainEvent,
    messageType: string,
    data: any,
    messageId: string,
  ) {
    console.debug("xipc/postToMain", messageType, data, messageId);
    const id = event.frameId;
    const peerToken = this.peerTokens.get(id);
    if (!peerToken) {
      console.error("no peer token for frameId", id);
      return;
    }
    this.messagenger.postToMain(peerToken, messageType, data, messageId);
  }

  windowForPeer(peerToken: PeerToken): BrowserWindow | undefined {
    for (const [id, token] of this.peerTokens) {
      if (token == peerToken) {
        return this.windows.get(id);
      }
    }
    return undefined;
  }

  createChatWindow(peerToken: PeerToken, options: {}) {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "chat.js"),
      },
    });

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/chat.html`);
    } else {
      mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/chat.html`),
      );
    }

    // cache the window
    const id = mainWindow.id;
    this.windows.set(id, mainWindow);
    this.peerTokens.set(id, peerToken);
    // messenger connect to the window
    this.messagenger.setChatChannel(
      peerToken,
      new WebviewChannel(peerToken, mainWindow.webContents),
    );

    // Clear the cache when the window is closed.
    mainWindow.on("close", (e) => {
      this.windows.delete(id);
      this.peerTokens.delete(id);
      this.messagenger.setChatChannel(peerToken, undefined);
    });

    // Open the DevTools.
    if (process.env.NODE_ENV === "development") {
      mainWindow.webContents.openDevTools();
    }
    // mainWindow.webContents.openDevTools();
  }


  createSettingsWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'settings.js'),
      },
    });
  
    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/settings.html`);
    } else {
      mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/settings.html`));
    }

    // Open the DevTools.
    if (process.env.NODE_ENV === "development") {
      mainWindow.webContents.openDevTools();
    }
  }
}
