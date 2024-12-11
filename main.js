const { app, BrowserWindow, ipcMain, dialog, net, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const { initGitService } = require('./services/gitService')
const { saveData, loadData } = require('./services/storageService')
const { exec } = require('child_process')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 开发环境使用本地服务器，生产环境使用打包后的文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
  }

  // 开发时打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }
}

// 获取默认缓存目录路径
function getDefaultCacheDirectory() {
  // 获取应用程序的安装目录
  const appPath = app.getAppPath()
  return path.join(appPath, 'cache')
}

// 确保缓存目录存在
function ensureCacheDirectory() {
  const cacheDir = getDefaultCacheDirectory()
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }
  return cacheDir
}

// 初始化或加载设置
async function initSettings() {
  const cacheDir = ensureCacheDirectory()
  const settingsPath = path.join(cacheDir, 'settings.json')
  
  try {
    if (!fs.existsSync(settingsPath)) {
      // 创建默认设置
      const defaultSettings = {
        dataDirectory: cacheDir,
        api: {
          modelType: 'chatgpt',
          url: '',
          apiKey: '',
          modelName: ''
        }
      }
      fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2))
      return defaultSettings
    }
    
    // 读取现有设置
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'))
    // 确保设置中有数据目录，如果没有则使用默认缓存目录
    if (!settings.dataDirectory) {
      settings.dataDirectory = cacheDir
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
    }
    return settings
  } catch (error) {
    console.error('初始化设置失败:', error)
    // 返回默认设置
    return { dataDirectory: cacheDir }
  }
}

// 在应用启动时初始化设置
app.whenReady().then(async () => {
  // 初始化设置
  const settings = await initSettings()
  
  // 创建窗口
  createWindow()
  
  // IPC通信处理
  ipcMain.handle('get-git-logs', async (event, { projectPath, startDate, endDate }) => {
    return await initGitService().getGitLogs(projectPath, startDate, endDate)
  })

  ipcMain.handle('save-task', async (event, taskData) => {
    return await saveData('tasks', taskData)
  })

  ipcMain.handle('load-tasks', async () => {
    return await loadData('tasks')
  })

  ipcMain.handle('save-tasks', async (event, tasks) => {
    return await saveData('tasks', tasks)
  })

  ipcMain.handle('dialog:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: '选择数据保存目录'
    })
    
    if (!result.canceled) {
      return result.filePaths[0]
    }
    return null
  })

  ipcMain.handle('settings:save', async (event, settings) => {
    try {
      // 保存设置到配置文件
      const settingsPath = path.join(app.getPath('userData'), 'settings.json')
      await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2))
      return true
    } catch (err) {
      console.error('保存设置失败:', err)
      throw err
    }
  })

  ipcMain.handle('settings:load', async () => {
    try {
      const settingsPath = path.join(app.getPath('userData'), 'settings.json')
      const data = await fs.promises.readFile(settingsPath, 'utf8')
      return JSON.parse(data)
    } catch (err) {
      if (err.code === 'ENOENT') {
        return null // 文件不存在时返回 null
      }
      throw err
    }
  })

  ipcMain.handle('save-settings', async (event, settings) => {
    try {
      const cacheDir = ensureCacheDirectory()
      const settingsPath = path.join(cacheDir, 'settings.json')
      
      // 确保设置中包含数据目录
      if (!settings.dataDirectory) {
        settings.dataDirectory = cacheDir
      }
      
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
      return { success: true, path: settingsPath }
    } catch (error) {
      console.error('保存设置失败:', error)
      throw new Error('保存设置失败: ' + error.message)
    }
  })

  // 保存数据
  ipcMain.handle('save-data', async (event, { fileName, directory, data }) => {
    try {
      const filePath = path.join(directory, fileName)
      
      // 确保目录存在
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true })
      }
      
      // 写入文件
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
      return { success: true, path: filePath }
    } catch (error) {
      console.error('保存数据失败:', error)
      throw new Error('保存数据失败: ' + error.message)
    }
  })

  // 加载数据
  ipcMain.handle('load-data', async (event, { fileName, directory }) => {
    try {
      const filePath = path.join(directory, fileName)
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        // 如果文件不存在，创建一个空文件
        fs.writeFileSync(filePath, JSON.stringify([]))
        return []
      }
      
      // 读取文件
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('加载数据失败:', error)
      // 如果出错，返回空数组而不是抛出错误
      return []
    }
  })

  ipcMain.handle('load-settings', async () => {
    try {
      const cacheDir = ensureCacheDirectory()
      const settingsPath = path.join(cacheDir, 'settings.json')
      
      if (fs.existsSync(settingsPath)) {
        const data = await fs.promises.readFile(settingsPath, 'utf8')
        return JSON.parse(data)
      }
      return null
    } catch (err) {
      console.error('加载设置失败:', err)
      return null
    }
  })

  ipcMain.handle('execute-command', async (event, { command, cwd }) => {
    return new Promise((resolve) => {
      exec(command, { cwd }, (error, stdout, stderr) => {
        resolve({
          error: error?.message || stderr,
          output: stdout
        })
      })
    })
  })

  // 添加 AI 请求处理器
  ipcMain.handle('make-ai-request', async (event, options) => {
    const { url, method, headers, body } = options;
    
    return new Promise((resolve, reject) => {
      const request = net.request({
        url,
        method: method || 'POST',
        headers: headers || {}
      });

      request.on('response', (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve({
              ok: response.statusCode >= 200 && response.statusCode < 300,
              status: response.statusCode,
              data: result
            });
          } catch (error) {
            reject(new Error('解析响应数据失败: ' + error.message));
          }
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      if (body) {
        request.write(JSON.stringify(body));
      }
      request.end();
    });
  });

  ipcMain.handle('save-report', async (event, { content, fileName }) => {
    try {
      // 获取系统下载目录
      const downloadsPath = app.getPath('downloads');
      const filePath = path.join(downloadsPath, fileName);
      
      // 使用 Promise 包装 fs.writeFile
      await new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, 'utf8', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      return {
        success: true,
        filePath: filePath
      };
    } catch (error) {
      console.error('保存报告失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('show-item-in-folder', async (event, filePath) => {
    shell.showItemInFolder(filePath);
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
}) 