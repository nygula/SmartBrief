const { ipcMain, dialog, BrowserWindow } = require('electron')
const Store = require('electron-store')
const store = new Store()
const path = require('path')
const { exec } = require('child_process')
const util = require('util')
const execPromise = util.promisify(exec)
const fs = require('fs')
const { app } = require('electron')

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

// 确保缓存目录存在
function ensureCacheDirectory() {
  const cacheDir = path.join(app.getPath('userData'), 'cache')
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }
  return cacheDir
}

// 保存设置
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const cacheDir = ensureCacheDirectory()
    const settingsPath = path.join(cacheDir, 'settings.json')
    
    console.log('保存设置到路径:', settingsPath)
    console.log('设置内容:', settings)
    
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
    return { success: true, path: settingsPath }
  } catch (error) {
    console.error('保存设置失败:', error)
    throw new Error('保存设置失败: ' + error.message)
  }
})

// 加载设置
ipcMain.handle('load-settings', async () => {
  try {
    const cacheDir = ensureCacheDirectory()
    const settingsPath = path.join(cacheDir, 'settings.json')
    
    console.log('尝试从路径加载设置:', settingsPath)
    
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8')
      const settings = JSON.parse(data)
      console.log('成功加载设置:', settings)
      return settings
    }
    console.log('设置文件不存在')
    return null
  } catch (err) {
    console.error('加载设置失败:', err)
    return null
  }
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