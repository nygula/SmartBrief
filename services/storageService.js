const fs = require('fs')
const pathService = require('./pathService')

// 确保目录存在
function ensureDirectories() {
  const dirs = pathService.getDirectories()
  
  // 检查并记录 cache 目录状态
  console.log('检查缓存目录状态:', {
    cachePath: dirs.cache,
    exists: fs.existsSync(dirs.cache)
  })

  // 检查并记录 settings.json 状态
  console.log('检查设置文件状态:', {
    settingsPath: pathService.settingsPath,
    exists: fs.existsSync(pathService.settingsPath)
  })

  // 只在目录不存在时创建
  if (!fs.existsSync(dirs.cache)) {
    console.log('创建缓存目录:', dirs.cache)
    fs.mkdirSync(dirs.cache, { recursive: true })
  } else {
    console.log('缓存目录已存在:', dirs.cache)
  }

  // 再次确认目录和文件状态
  console.log('目录创建后状态:', {
    cacheExists: fs.existsSync(dirs.cache),
    settingsExists: fs.existsSync(pathService.settingsPath)
  })

  return dirs
}

async function saveData(key, data) {
  ensureDirectories()
  // 直接使用 getCachePath 获取文件路径
  const filePath = pathService.getCachePath(`${key}.json`)
  try {
    console.log('保存数据到文件:', filePath)
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('保存数据失败:', error)
    throw error
  }
}

async function loadData(key) {
  // 直接使用 getCachePath 获取文件路径
  const filePath = pathService.getCachePath(`${key}.json`)
  try {
    console.log('从文件加载数据:', filePath)
    if (fs.existsSync(filePath)) {
      const data = await fs.promises.readFile(filePath, 'utf-8')
      return JSON.parse(data)
    }
    console.log('文件不存在:', filePath)
    return null
  } catch (error) {
    console.error('读取数据失败:', error)
    throw error
  }
}

module.exports = { saveData, loadData, ensureDirectories } 