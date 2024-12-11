const { app } = require('electron')
const path = require('path')

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

  // 获取数据文件完整路径 (现在也统一存放在 cache 目录)
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
}

module.exports = new PathService()
