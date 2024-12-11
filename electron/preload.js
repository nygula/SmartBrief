const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  saveData: (params) => ipcRenderer.invoke('save-data', params),
  loadData: (params) => ipcRenderer.invoke('load-data', params),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getAppDirectories: () => ipcRenderer.invoke('get-app-directories')
}) 