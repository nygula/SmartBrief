const fs = require('fs')
const path = require('path')
const { app } = require('electron')

const DATA_DIR = path.join(app.getPath('userData'), 'data')

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

async function saveData(key, data) {
  const filePath = path.join(DATA_DIR, `${key}.json`)
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('保存数据失败:', error)
    throw error
  }
}

async function loadData(key) {
  const filePath = path.join(DATA_DIR, `${key}.json`)
  try {
    if (fs.existsSync(filePath)) {
      const data = await fs.promises.readFile(filePath, 'utf-8')
      return JSON.parse(data)
    }
    return null
  } catch (error) {
    console.error('读取数据失败:', error)
    throw error
  }
}

module.exports = { saveData, loadData } 