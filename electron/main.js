const { ipcMain, dialog } = require('electron')
const Store = require('electron-store')
const store = new Store()

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