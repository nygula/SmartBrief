const { ipcMain, dialog, BrowserWindow } = require('electron')
const Store = require('electron-store')
const store = new Store()
const path = require('path')
const { exec } = require('child_process')
const util = require('util')
const execPromise = util.promisify(exec)

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

// 添加命令执行处理程序
ipcMain.handle('execute-command', async (event, { command, cwd }) => {
  try {
    const { stdout, stderr } = await execPromise(command, { cwd })
    if (stderr && !stdout) {  // 有些 Git 命令会输出 stderr 但仍然是正常的
      return { error: stderr }
    }
    return { output: stdout }
  } catch (error) {
    return { error: error.message }
  }
})

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  // ... 其他代码
} 