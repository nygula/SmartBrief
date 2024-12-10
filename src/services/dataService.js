class DataService {
  constructor() {
    this.dataDirectory = ''
  }

  setDataDirectory(directory) {
    this.dataDirectory = directory
  }

  async saveTaskList(tasks) {
    if (!this.dataDirectory) {
      throw new Error('未设置数据目录')
    }
    
    try {
      if (!window.electronAPI) {
        throw new Error('electronAPI 不可用')
      }

      // 确保数据是可序列化的
      const cleanTasks = tasks.map(task => ({
        id: task.id,
        name: task.name,
        priority: task.priority,
        hours: task.hours,
        progress: task.progress,
        notes: task.notes
      }))

      await window.electronAPI.saveData({
        fileName: 'tasks.json',
        directory: this.dataDirectory,
        data: cleanTasks
      })
    } catch (error) {
      console.error('保存任务数据失败:', error)
      throw error
    }
  }

  async loadTaskList() {
    if (!this.dataDirectory) {
      return []
    }
    
    try {
      if (!window.electronAPI) {
        throw new Error('electronAPI 不可用')
      }

      const tasks = await window.electronAPI.loadData({
        fileName: 'tasks.json',
        directory: this.dataDirectory
      })
      
      return Array.isArray(tasks) ? tasks : []
    } catch (error) {
      console.error('加载任务数据失败:', error)
      return []
    }
  }

  async saveReportConfig(config) {
    if (!this.dataDirectory) {
      throw new Error('未设置数据目录')
    }
    
    try {
      if (!window.electronAPI) {
        throw new Error('electronAPI 不可用')
      }

      // 确保数据是可序列化的
      const cleanConfig = JSON.parse(JSON.stringify(config))

      await window.electronAPI.saveData({
        fileName: 'report-config.json',
        directory: this.dataDirectory,
        data: cleanConfig
      })
    } catch (error) {
      console.error('保存报告配置失败:', error)
      throw error
    }
  }

  async loadReportConfig() {
    if (!this.dataDirectory) {
      return null
    }
    
    try {
      if (!window.electronAPI) {
        throw new Error('electronAPI 不可用')
      }

      const config = await window.electronAPI.loadData({
        fileName: 'report-config.json',
        directory: this.dataDirectory
      })
      
      return config || null
    } catch (error) {
      console.error('加载报告配置失败:', error)
      return null
    }
  }
}

export const dataService = new DataService() 