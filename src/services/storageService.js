// 使用 localStorage 作为临时存储
const TASKS_KEY = 'tasks'

export default {
  async loadTasks() {
    try {
      const tasksJson = localStorage.getItem(TASKS_KEY)
      return tasksJson ? JSON.parse(tasksJson) : []
    } catch (error) {
      console.error('加载任务失败:', error)
      return []
    }
  },

  async saveTasks(tasks) {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
    } catch (error) {
      console.error('保存任务失败:', error)
      throw error
    }
  }
} 