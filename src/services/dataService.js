class DataService {
  async saveTaskList(tasks) {
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

      const result = await window.electronAPI.saveData({
        fileName: 'tasks.json',
        data: cleanTasks
      })

      console.log('保存任务结果:', result)
      return result
    } catch (error) {
      console.error('保存任务数据失败:', error)
      throw error
    }
  }

  async loadTaskList() {
    try {
      if (!window.electronAPI) {
        throw new Error('electronAPI 不可用')
      }

      const tasks = await window.electronAPI.loadData({
        fileName: 'tasks.json'
      })
      
      return Array.isArray(tasks) ? tasks : []
    } catch (error) {
      console.error('加载任务数据失败:', error)
      return []
    }
  }
}

export const dataService = new DataService()

// 默认导出
export default dataService 