import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';
import { SocketIPCServer } from './core/ipc/SocketIPCServer';
import {App} from './app';
import { chatPeerToken } from './core/ipc/Message';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const coreApp = new App();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  coreApp.onReady();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  coreApp.onWindowAllClosed();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  coreApp.onActivate();
});

app.on('will-quit', () => {
  coreApp.onWillQuit();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
