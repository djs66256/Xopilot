
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // we can also expose variables, not just functions
  send: (log: string) => {
    console.log('send' + log);
  }
})

const receive_message_bridge = (event: any, messageType: string, data: any, messageId: string) => {
  console.log(`[IPC] receive from main: ${messageType}, ${data}`)
  window.postMessage({
    type: 'message',
    messageType,
    data,
    messageId
  }, '*')
}

contextBridge.exposeInMainWorld('xipc', {
  postToMain: (
    messageType: string,
    data: any,
    messageId: string) => {
    console.log(`[IPC] send to main: ${messageType}, ${data}`)
    ipcRenderer.send('xipc/postToMain', messageType, data, messageId)
  },

  on: () => {
      console.log('[IPC] on')
      ipcRenderer.on('xipc/postToRender', receive_message_bridge)
  },

  off: () => {
    console.log('[IPC] off')
    ipcRenderer.off('xipc/postToRender', receive_message_bridge)
  }
})