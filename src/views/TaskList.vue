<template>
  <div class="task-list">
    <!-- 顶部统计和操作区 -->
    <div class="task-header">
      <!-- 任务统计信息 -->
      <div class="task-stats">
        <div class="stat-item">
          <span class="stat-label">总任务:</span>
          <span class="stat-value">{{ totalTasks }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已完成:</span>
          <span class="stat-value">{{ completedTasks }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">进行中:</span>
          <span class="stat-value">{{ inProgressTasks }}</span>
        </div>
      </div>

      <!-- 导入按钮组 -->
      <div class="task-actions">
        <TaskImport @tasks-imported="handleTasksImported" />
      </div>
    </div>

    <!-- 添加任务表单 -->
    <div class="add-task-form">
      <input type="text" v-model="newTask.name" placeholder="输入任务名称" />
      <select v-model="newTask.priority">
        <option value="高">高</option>
        <option value="中">中</option>
        <option value="低">低</option>
      </select>
      <input type="number" v-model="newTask.hours" placeholder="工时" />
      <input type="number" v-model="newTask.progress" placeholder="进度" />
      <input type="text" v-model="newTask.notes" placeholder="添加备注信息" />
      <button class="add-task-btn" @click="addTask">添加任务</button>
    </div>

    <!-- 任务列表表头 -->
    <div class="task-list-header">
      <div class="task-name">任务名称</div>
      <div class="priority">优先级</div>
      <div class="hours">工时</div>
      <div class="progress">进度</div>
      <div class="notes">备注</div>
      <div class="actions">操作</div>
    </div>

    <!-- 任务列表内容 -->
    <div class="task-items">
      <!-- 现有的任务列表内容 -->
    </div>
  </div>
</template>

<script>
import { dataService } from '../services/dataService'
import { EventBus } from '../eventBus'
import TaskImport from '../components/TaskImport.vue'

export default {
  name: 'TaskList',
  components: {
    TaskImport
  },
  data() {
    return {
      tasks: [],
      newTask: {
        name: '',
        priority: '中',
        hours: 0,
        progress: 0,
        notes: ''
      }
    }
  },
  computed: {
    totalTasks() {
      return this.tasks.length
    },
    completedTasks() {
      return this.tasks.filter(task => task.progress === 100).length
    },
    inProgressTasks() {
      return this.tasks.filter(task => task.progress < 100).length
    }
  },
  methods: {
    async addTask() {
      if (!this.newTask.name) {
        alert('请输入任务名称')
        return
      }
      
      const task = {
        id: Date.now(),
        ...this.newTask
      }
      
      this.tasks.push(task)
      await this.saveTaskList()
      EventBus.emit('taskListUpdated', this.tasks)
      
      // 重置表单
      this.newTask = {
        name: '',
        priority: '中',
        hours: 0,
        progress: 0,
        notes: ''
      }
    },
    
    async deleteTask(taskId) {
      this.tasks = this.tasks.filter(task => task.id !== taskId)
      await this.saveTaskList()
      EventBus.emit('taskListUpdated', this.tasks)
    },
    
    async saveTaskList() {
      try {
        await dataService.saveTaskList(this.tasks)
        EventBus.emit('taskListUpdated', this.tasks)
      } catch (error) {
        console.error('保存任务列表失败:', error)
        alert('保存任务列表失败: ' + error.message)
      }
    },
    
    async loadTaskList() {
      try {
        const tasks = await dataService.loadTaskList()
        if (tasks) {
          this.tasks = tasks
        }
      } catch (error) {
        console.error('加载任务列表失败:', error)
        alert('加载任务列表失败: ' + error.message)
      }
    },
    
    handleTasksImported(tasks) {
      this.tasks = tasks;
      this.$emit('tasks-updated', tasks);
    }
  },
  
  async mounted() {
    try {
      console.log('开始加载设置...')
      // 从标准缓存目录加载设置
      const settings = await window.electronAPI.loadSettings()
      console.log('加载到的设置:', settings)
      
      // 直接加载任务列表，不需要设置数据目录
      await this.loadTaskList()
    } catch (error) {
      console.error('初始化失败:', error)
      // 即使出错也尝试加载任务列表
      await this.loadTaskList()
    }
  },
  
  watch: {
    // 监听任务变化自动保存（可选）
    tasks: {
      deep: true,
      handler() {
        this.saveTaskList()
      }
    }
  }
}
</script>

<style scoped>
.task-list {
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9em;
}

.stat-value {
  color: var(--text-primary);
  font-size: 1.1em;
  font-weight: 600;
}

.task-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.add-task-form {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 2fr auto;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-task-form input,
.add-task-form select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-primary);
}

.add-task-btn {
  padding: 8px 16px;
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-task-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 108, 255, 0.2);
}

.task-list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 2fr auto;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  margin-bottom: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

/* 其他现有样式保持不变 */
</style> 