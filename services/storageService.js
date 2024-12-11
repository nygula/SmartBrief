const fs = require('fs')
const pathService = require('./pathService')

// 确保目录存在
function ensureDirectories() {
  const dirs = pathService.getDirectories()
  // 只需要确保 cache 目录存在
  if (!fs.existsSync(dirs.cache)) {
    console.log('创建缓存目录:', dirs.cache)
    fs.mkdirSync(dirs.cache, { recursive: true })
  } else {
    console.log('缓存目录已存在:', dirs.cache)
  }
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