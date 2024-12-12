const { app } = require('electron')
const path = require('path')
const fs = require('fs')

class PathService {
  constructor() {
    // 使用 Electron 标准用户数据目录作为基础目录
    this.baseDir = app.getPath('userData')
    // 所有文件统一存放在 cache 目录下
    this.cacheDir = path.join(this.baseDir, 'cache')
    // 设置文件也放在 cache 目录下
    this.settingsPath = path.join(this.cacheDir, 'settings.json')

    // 打印初始化的路径信息
    console.log('应用基础目录:', this.baseDir)
    console.log('缓存目录:', this.cacheDir)
    console.log('设置文件路径:', this.settingsPath)
  }

  // 获取缓存文件完整路径
  getCachePath(fileName) {
    const filePath = path.join(this.cacheDir, fileName)
    console.log('获取缓存文件路径:', filePath)
    return filePath
  }

  // 获取数据文件完整路径
  getDataPath(fileName) {
    const filePath = path.join(this.cacheDir, fileName)
    console.log('获取数据文件路径:', filePath)
    return filePath
  }

  // 获取应用目录
  getDirectories() {
    const dirs = {
      base: this.baseDir,
      cache: this.cacheDir
    }
    console.log('获取应用目录列表:', dirs)
    return dirs
  }

  // 保存设置
  async saveSettings(settings) {
    try {
      console.log('保存设置到文件:', this.settingsPath)
      await fs.promises.writeFile(
        this.settingsPath,
        JSON.stringify(settings, null, 2)
      )
      console.log('设置保存成功')
      return true
    } catch (error) {
      console.error('保存设置失败:', error)
      return false
    }
  }

  // 加载设置
  async loadSettings() {
    try {
      console.log('从文件加载设置:', this.settingsPath)
      if (!fs.existsSync(this.settingsPath)) {
        return null
      }
      const data = await fs.promises.readFile(this.settingsPath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('加载设置失败:', error)
      return null
    }
  }
}

module.exports = new PathService()
