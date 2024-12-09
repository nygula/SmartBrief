const { ipcMain, dialog, BrowserWindow } = require('electron')
const Store = require('electron-store')
const store = new Store()
const path = require('path')

// 选择目录
ipcMain.handle('show-directory-picker', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  
  if (!result.canceled) {
    return result.filePaths[0]
  }
  return null
})

// 保存设置
ipcMain.handle('save-settings', async (event, settings) => {
  store.set('settings', settings)
  return true
})

// 加载设置
ipcMain.handle('load-settings', async () => {
  return store.get('settings')
})

// 添加 IPC 处理器
ipcMain.handle('open-directory-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  return result
})

const mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
}) 