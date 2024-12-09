const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  loadTasks: () => ipcRenderer.invoke('load-tasks'),
  saveTask: (task) => ipcRenderer.invoke('save-task', task),
  saveTasks: (tasks) => ipcRenderer.invoke('save-tasks', tasks),
  getGitLogs: (params) => ipcRenderer.invoke('get-git-logs', params),
  selectDirectory: () => ipcRenderer.invoke('select-directory')
}) 