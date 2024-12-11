const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')

// 在 app ready 之后添加
ipcMain.handle('load-settings', async () => {
  try {
    const userDataPath = app.getPath('userData')
    const settingsPath = path.join(userDataPath, 'settings.json')
    
    // 如果设置文件不存在，创建默认设置
    if (!fs.existsSync(settingsPath)) {
      const defaultSettings = {
        // 你的默认设置
      }
      fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2))
      return defaultSettings
    }
    
    // 读取设置文件
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
    return settings
  } catch (error) {
    console.error('加载设置失败:', error)
    throw error
  }
}) 