const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  loadTasks: () => ipcRenderer.invoke('load-tasks'),
  saveTask: (task) => ipcRenderer.invoke('save-task', task),
  saveTasks: (tasks) => ipcRenderer.invoke('save-tasks', tasks),
  getGitLogs: (params) => ipcRenderer.invoke('get-git-logs', params),
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  loadSettings: () => ipcRenderer.invoke('settings:load')
})

contextBridge.exposeInMainWorld('electron', {
  showDirectoryPicker: () => ipcRenderer.invoke('show-directory-picker'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings')
}) 