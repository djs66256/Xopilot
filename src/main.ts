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
  coreApp.start();

  coreApp.createChatWindow(chatPeerToken, {})
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    coreApp.createChatWindow(chatPeerToken, {})
  }
});

app.on('will-quit', () => {
  coreApp.stop()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
