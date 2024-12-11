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

  // 添加保存报告配置方法
  async saveReportConfig(data) {
    try {
      if (!window.electronAPI) {
        throw new Error('electronAPI 不可用')
      }

      // 创建一个干净的配置对象，只包含需要的数据
      const cleanConfig = {
        config: {
          reportType: data.config.reportType,
          includeCommits: data.config.includeCommits,
          includeTasks: data.config.includeTasks,
          includeStats: data.config.includeStats,
          aiDepth: data.config.aiDepth,
          customPrompt: data.config.customPrompt
        },
        projects: data.projects.map(project => ({
          path: project.path,
          startDate: project.startDate,
          endDate: project.endDate
        })),
        selectedTags: Array.isArray(data.selectedTags) ? [...data.selectedTags] : []
      }

      console.log('准备保存的报告配置:', cleanConfig)

      const result = await window.electronAPI.saveData({
        fileName: 'report-config.json',
        data: cleanConfig
      })

      console.log('保存报告配置结果:', result)
      return result
    } catch (error) {
      console.error('保存报告配置失败:', error)
      throw error
    }
  }

  // 添加加载报告配置方法
  async loadReportConfig() {
    try {
      if (!window.electronAPI) {
        throw new Error('electronAPI 不可用')
      }

      const config = await window.electronAPI.loadData({
        fileName: 'report-config.json'
      })
      
      // 确保返回默认值
      return config || {
        config: {
          reportType: 'weekly',
          includeCommits: true,
          includeTasks: true,
          includeStats: true,
          aiDepth: 'detailed',
          customPrompt: '帮我整理成周报'
        },
        projects: [],
        selectedTags: []
      }
    } catch (error) {
      console.error('加载报告配置失败:', error)
      // 返回默认配置
      return {
        config: {
          reportType: 'weekly',
          includeCommits: true,
          includeTasks: true,
          includeStats: true,
          aiDepth: 'detailed',
          customPrompt: '帮我整理成周报'
        },
        projects: [],
        selectedTags: []
      }
    }
  }
}

export const dataService = new DataService()

// 默认导出
export default dataService 