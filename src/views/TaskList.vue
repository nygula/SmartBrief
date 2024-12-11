<template>
  <div class="task-list-container">
    <!-- 任务统计 -->
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

    <!-- 新任务输入区域 -->
    <div class="new-task-section">
      <div class="input-row">
        <div class="input-group name-input">
          <label>任务名称</label>
          <input 
            type="text" 
            v-model="newTask.name"
            placeholder="输入任务名称"
          >
        </div>
        
        <div class="input-group">
          <label>优先级</label>
          <select v-model="newTask.priority">
            <option value="低">低</option>
            <option value="中">中</option>
            <option value="高">高</option>
          </select>
        </div>
        
        <div class="input-group">
          <label>工时(小时)</label>
          <input 
            type="number" 
            v-model="newTask.hours"
            min="0"
          >
        </div>
        
        <div class="input-group">
          <label>进度(%)</label>
          <input 
            type="number" 
            v-model="newTask.progress"
            min="0" 
            max="100"
          >
        </div>
        
        <div class="input-group notes-input">
          <label>备注</label>
          <input 
            type="text" 
            v-model="newTask.notes"
            placeholder="添加备注信息"
          >
        </div>

        <button @click="addTask" class="add-task-button">
          <i class="plus-icon"></i>
          添加任务
        </button>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-section">
      <div class="section-header">
        <div class="header-item name">任务名称</div>
        <div class="header-item priority">优先级</div>
        <div class="header-item hours">工时</div>
        <div class="header-item progress">进度</div>
        <div class="header-item notes">备注</div>
        <div class="header-item actions">操作</div>
      </div>

      <transition-group name="list" tag="div" class="task-list">
        <div v-for="task in tasks" :key="task.id" class="task-item">
          <div class="task-name">{{ task.name }}</div>
          <div class="task-priority">
            <span :class="['priority-badge', task.priority]">
              {{ task.priority }}
            </span>
          </div>
          <div class="task-hours">{{ task.hours }}h</div>
          <div class="task-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: task.progress + '%' }"
                :class="{ completed: task.progress === 100 }"
              ></div>
            </div>
            <span class="progress-text">{{ task.progress }}%</span>
          </div>
          <div class="task-notes">{{ task.notes }}</div>
          <div class="task-actions">
            <button @click="deleteTask(task.id)" class="delete-button">
              删除
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import { dataService } from '../services/dataService'
import { EventBus } from '../eventBus'

export default {
  name: 'TaskList',
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
.task-list-container {
  padding: 20px;
  background: var(--bg-dark);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

/* 任务统计样式 */
.task-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 15px;
  background: rgba(100, 108, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(100, 108, 255, 0.2);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: var(--text-light);
  font-size: 0.9em;
}

.stat-value {
  font-size: 1.2em;
  font-weight: bold;
  color: var(--primary-color);
  text-shadow: 0 0 10px rgba(100, 108, 255, 0.3);
}

/* 新任务输入区域样式 */
.new-task-section {
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.input-row {
  display: flex;
  gap: 20px;
  align-items: flex-end;
}

.input-group {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.name-input {
  width: 200px;
}

.notes-input {
  flex: 1;
}

.input-group label {
  color: var(--text-light);
  font-size: 0.9em;
}

input, select {
  padding: 10px;
  background: var(--input-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-light);
  transition: all 0.3s ease;
}

input:focus, select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
  outline: none;
}

.add-task-button {
  background: var(--primary-gradient);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  justify-self: start;
  align-self: end;
}

.add-task-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(100, 108, 255, 0.4);
}

/* 任务列表样式 */
.tasks-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.section-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr 2fr 1fr;
  padding: 15px;
  background: var(--primary-gradient);
  color: white;
  font-weight: 500;
}

.task-list {
  display: flex;
  flex-direction: column;
}

.task-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr 2fr 1fr;
  padding: 15px;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.task-item:hover {
  background: rgba(100, 108, 255, 0.1);
  transform: translateX(5px);
}

.priority-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9em;
  font-weight: 500;
}

.priority-badge.高 {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
}

.priority-badge.中 {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.priority-badge.低 {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-gradient);
  transition: width 0.3s ease;
}

.progress-fill.completed {
  background: #28a745;
}

.progress-text {
  font-size: 0.9em;
  color: var(--text-light);
  margin-left: 8px;
}

.delete-button {
  padding: 6px 12px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background: #ff2020;
  transform: scale(1.1);
}

/* 动画效果 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.plus-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>');
}
</style> 