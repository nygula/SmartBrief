const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs').promises
const fsSync = require('fs')

// 获取应用数据目录
function getAppDirectory() {
  return {
    userData: app.getPath('userData'),
    cache: path.join(app.getPath('userData'), 'cache'),
    data: path.join(app.getPath('userData'), 'data')
  }
}

// 确保所需目录存在
function ensureDirectories() {
  const dirs = getAppDirectory()
  Object.values(dirs).forEach(dir => {
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, { recursive: true })
    }
  })
  return dirs
}

// 初始化设置
async function initSettings() {
  const dirs = ensureDirectories()
  const settingsPath = path.join(dirs.cache, 'settings.json')
  
  try {
    if (!fsSync.existsSync(settingsPath)) {
      const defaultSettings = {
        dataDirectory: dirs.data,
        api: {
          modelType: 'chatgpt',
          url: '',
          apiKey: '',
          modelName: ''
        }
      }
      await fs.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 2))
      return defaultSettings
    }
    
    const settings = JSON.parse(await fs.readFile(settingsPath, 'utf8'))
    if (!settings.dataDirectory) {
      settings.dataDirectory = dirs.data
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2))
    }
    return settings
  } catch (error) {
    console.error('初始化设置失败:', error)
    return { dataDirectory: dirs.data }
  }
}

// 创建主窗口
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 根据环境加载不同URL
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  return win
}

// 保存设置
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const dirs = ensureDirectories()
    const settingsPath = path.join(dirs.cache, 'settings.json')
    
    console.log('保存设置到路径:', settingsPath)
    console.log('设置内容:', settings)
    
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2))
    return { success: true, path: settingsPath }
  } catch (error) {
    console.error('保存设置失败:', error)
    throw new Error('保存设置失败: ' + error.message)
  }
})

// 加载设置
ipcMain.handle('load-settings', async () => {
  try {
    const dirs = ensureDirectories()
    const settingsPath = path.join(dirs.cache, 'settings.json')
    
    console.log('尝试从路径加载设置:', settingsPath)
    
    if (fsSync.existsSync(settingsPath)) {
      const data = await fs.readFile(settingsPath, 'utf8')
      const settings = JSON.parse(data)
      console.log('成功加载设置:', settings)
      return settings
    }
    
    // 如果设置文件不存在，创建默认设置
    const defaultSettings = {
      dataDirectory: dirs.data,
      api: {
        modelType: 'chatgpt',
        url: '',
        apiKey: '',
        modelName: ''
      }
    }
    
    // 保存默认设置
    await fs.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 2))
    console.log('创建默认设置:', defaultSettings)
    return defaultSettings
    
  } catch (error) {
    console.error('加载设置失败:', error)
    throw error
  }
})

// 保存数据
ipcMain.handle('save-data', async (event, { fileName, directory, data }) => {
  try {
    const dirs = ensureDirectories()
    // 如果提供了指定目录就使用指定目录，否则使用默认数据目录
    const targetDir = directory || dirs.data
    const filePath = path.join(targetDir, fileName)
    
    console.log('保存数据到路径:', filePath)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    return { success: true, path: filePath }
  } catch (error) {
    console.error('保存数据失败:', error)
    throw new Error('保存数据失败: ' + error.message)
  }
})

// 加载数据
ipcMain.handle('load-data', async (event, { fileName }) => {
  try {
    const dirs = ensureDirectories()
    const filePath = path.join(dirs.data, fileName)
    
    if (fsSync.existsSync(filePath)) {
      const data = await fs.readFile(filePath, 'utf8')
      return JSON.parse(data)
    }
    return null
  } catch (error) {
    console.error('加载数据失败:', error)
    return null
  }
})

// 选择目录
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  return result.canceled ? null : result.filePaths[0]
})

// 获取应用目录
ipcMain.handle('get-app-directories', () => {
  return getAppDirectory()
})

// 应用启动
app.whenReady().then(async () => {
  // 初始化设置
  const settings = await initSettings()
  console.log('应用启动时的设置:', settings)
  
  // 创建窗口
  const mainWindow = createWindow()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
}) 