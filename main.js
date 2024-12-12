const { app, BrowserWindow, ipcMain, dialog, net, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const { initGitService } = require(path.join(__dirname, 'services/gitService'))
const pathService = require('./services/pathService')
const { saveData, loadData, ensureDirectories } = require('./services/storageService')
const { exec } = require('child_process')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    resizable: true,
    icon: getAppIcon(),
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

// 根据平台返回对应的图标
function getAppIcon() {
  switch (process.platform) {
    case 'win32':
      return path.join(__dirname, 'logo/windows.ico')
    case 'darwin':
      return path.join(__dirname, 'logo/macos.icns')
    case 'linux':
      return path.join(__dirname, 'logo/linux.png')
    default:
      return path.join(__dirname, 'logo/windows.ico')
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
  ensureDirectories()
  
  try {
    if (!fs.existsSync(pathService.settingsPath)) {
      const defaultSettings = {
        dataDirectory: pathService.dataDir,
        api: {
          modelType: 'chatgpt',
          url: '',
          apiKey: '',
          modelName: ''
        }
      }
      await fs.promises.writeFile(
        pathService.settingsPath, 
        JSON.stringify(defaultSettings, null, 2)
      )
      return defaultSettings
    }
    
    const settings = JSON.parse(
      await fs.promises.readFile(pathService.settingsPath, 'utf8')
    )
    if (!settings.dataDirectory) {
      settings.dataDirectory = pathService.dataDir
      await fs.promises.writeFile(
        pathService.settingsPath,
        JSON.stringify(settings, null, 2)
      )
    }
    return settings
  } catch (error) {
    console.error('初始化设置失败:', error)
    return { dataDirectory: pathService.dataDir }
  }
}

// 在应用启动时初始化设置
app.whenReady().then(async () => {
  ensureDirectories()
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
      console.log('保存设置到路径:', pathService.settingsPath)
      console.log('设置内容:', settings)
      
      await fs.promises.writeFile(
        pathService.settingsPath, 
        JSON.stringify(settings, null, 2)
      )
      return { success: true }
    } catch (error) {
      console.error('保存设置失败:', error)
      throw error
    }
  })

  ipcMain.handle('load-settings', async () => {
    try {
      console.log('从路径加载设置:', pathService.settingsPath)
      
      if (!fs.existsSync(pathService.settingsPath)) {
        console.log('设置文件不存在，创建默认设置')
        const defaultSettings = {
          api: {
            modelType: 'chatgpt',
            url: '',
            apiKey: '',
            modelName: ''
          }
        }
        
        await fs.promises.writeFile(
          pathService.settingsPath,
          JSON.stringify(defaultSettings, null, 2)
        )
        return defaultSettings
      }
      
      const data = await fs.promises.readFile(pathService.settingsPath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('加载设置失败:', error)
      throw error
    }
  })

  // 保存数据
  ipcMain.handle('save-data', async (event, { fileName, data }) => {
    try {
      const filePath = pathService.getDataPath(fileName)
      console.log('保存数据到路径:', filePath)
      
      // 确保数据目录存在
      ensureDirectories()
      
      // 写入文件
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
      return { success: true, path: filePath }
    } catch (error) {
      console.error('保存数据失败:', error)
      throw new Error('保存数据失败: ' + error.message)
    }
  })

  // 加载数据
  ipcMain.handle('load-data', async (event, { fileName }) => {
    try {
      const filePath = pathService.getDataPath(fileName)
      console.log('从路径加载数据:', filePath)
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        console.log('文件不存在，创建新文件:', filePath)
        fs.writeFileSync(filePath, JSON.stringify([]))
        return []
      }
      
      // 读取文件
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('加载数据失败:', error)
      return []
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