const { contextBridge, ipcRenderer } = require('electron')

// 暴露 electronAPI 接口到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 选择目录方法
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  // 保存设置
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  // 加载设置
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  loadData: (data) => ipcRenderer.invoke('load-data', data),
  executeCommand: (options) => ipcRenderer.invoke('execute-command', options),
  makeAIRequest: (options) => ipcRenderer.invoke('make-ai-request', options),
  saveReport: (options) => ipcRenderer.invoke('save-report', options),
  showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath)
}) 