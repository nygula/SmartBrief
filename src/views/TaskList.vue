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
      <div class="input-group">
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
        <label>进度</label>
        <input 
          type="number" 
          v-model="newTask.progress"
          min="0" 
          max="100"
        >
      </div>
      
      <div class="input-group">
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
    addTask() {
  <div class="task-list">
    <div class="card">
      <div class="header">
        <h2>任务列表</h2>
        <div class="task-stats">
          <span>总任务: {{ tasks.length }}</span>
          <span>已完成: {{ completedTasks }}</span>
          <span>进行中: {{ inProgressTasks }}</span>
        </div>
      </div>
      <div class="task-form">
        <div class="form-group">
          <label>任务名称</label>
          <input v-model="newTask.name" placeholder="任务名称" class="input" />
        </div>
        <div class="form-group">
          <label>优先级</label>
          <select v-model="newTask.level" class="select">
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
        </div>
        <div class="form-group">
          <label>工时(小时)</label>
          <input 
            v-model.number="newTask.hours" 
            type="number" 
            min="0.1" 
            step="0.1"
            placeholder="工时" 
            class="input" 
          />
        </div>
        <div class="form-group">
          <label>进度</label>
          <input 
            v-model.number="newTask.progress" 
            type="number" 
            min="0" 
            max="100" 
            placeholder="进度%" 
            class="input" 
          />
        </div>
        <div class="form-group">
          <label>备注</label>
          <textarea v-model="newTask.notes" class="input textarea" placeholder="任务备注"></textarea>
        </div>
        <button 
          @click="addTask" 
          class="btn" 
          :disabled="!isValidTask"
          :title="!isValidTask ? '请填写必要信息' : '添加任务'"
        >
          添加任务
        </button>
      </div>

      <div class="table-container">
        <table class="task-table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>优先级</th>
              <th>工时</th>
              <th>进度</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tasks" :key="task.id">
              <td>
                <div class="task-name" @click="startEdit(task)">
                  <span v-if="!task.editing">{{ task.name }}</span>
                  <input
                    v-else
                    v-model="task.name"
                    class="input"
                    @blur="finishEdit(task)"
                    @keyup.enter="finishEdit(task)"
                    ref="editInput"
                  />
                </div>
              </td>
              <td>
                <span class="priority" :class="task.level">{{ task.level }}</span>
              </td>
              <td>{{ task.hours }}h</td>
              <td>
                <div class="progress-bar">
                  <div class="progress" :style="{ width: task.progress + '%' }"></div>
                  <span>{{ task.progress }}%</span>
                </div>
              </td>
              <td>
                <div class="notes" @click="editNotes(task)">
                  {{ task.notes || '暂无备注' }}
                </div>
              </td>
              <td>
                <button @click="deleteTask(task.id)" class="btn btn-danger">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'TaskList',
  setup() {
    const store = useStore()
    const tasks = computed(() => store.state.tasks)
    const newTask = ref({
      name: '',
      level: '中',
      hours: 0,
      progress: 0,
      notes: '',
      editing: false
    })

    const isValidTask = computed(() => {
      const nameValid = newTask.value.name.trim().length > 0
      const hoursValid = newTask.value.hours > 0
      const progressValid = newTask.value.progress >= 0 && newTask.value.progress <= 100

      console.log('表单验证详情:', {
        nameValid,
        hoursValid,
        progressValid,
        name: newTask.value.name,
        hours: newTask.value.hours,
        progress: newTask.value.progress
      })

      return nameValid && hoursValid && progressValid
    })

    const completedTasks = computed(() => {
      return tasks.value.filter(task => task.progress === 100).length
    })

    const inProgressTasks = computed(() => {
      return tasks.value.filter(task => task.progress < 100).length
    })

    onMounted(async () => {
      try {
        await store.dispatch('loadTasks')
      } catch (error) {
        console.error('加载任务失败:', error)
        alert('加载任务失败，请刷新页面重试')
      }
    })

    const addTask = async () => {
      console.log('添加任务按钮被点击')
      console.log('当前表单数据:', newTask.value)
      console.log('表单验证结果:', isValidTask.value)
      
      if (!isValidTask.value) {
        console.log('表单验证未通过，请检查：')
        if (!newTask.value.name.trim()) {
          alert('请输入任务名称')
          return
        }
        if (newTask.value.hours <= 0) {
          alert('工时必须大于0')
          return
        }
        if (newTask.value.progress < 0 || newTask.value.progress > 100) {
          alert('进度必须在0-100之间')
          return
        }
        return
      }
      
      const task = {
        id: Date.now(),
        ...newTask.value
      }
      delete task.editing

      try {
        await store.dispatch('saveTask', task)
        console.log('任务保存成功')
        
        // 重置表单
        newTask.value = {
          name: '',
          level: '中',
          hours: 0,
          progress: 0,
          notes: '',
          editing: false
        }
      } catch (error) {
        console.error('添加任务失败:', error)
        alert('添加任务失败，请重试')
      }
    }

    const startEdit = (task) => {
      task.editing = true
      task._previousName = task.name
      setTimeout(() => {
        const input = document.querySelector(`.task-name input`)
        if (input) input.focus()
      })
    }

    const finishEdit = async (task) => {
      if (!task.name.trim()) {
        task.name = task._previousName
      }
      task.editing = false
      delete task._previousName
      try {
        await store.dispatch('saveTasks', [...tasks.value])
        tasks.value = store.state.tasks
      } catch (error) {
        console.error('保存任务失败:', error)
        alert('保存任务失败，请重试')
      }
    }

    const editNotes = (task) => {
      const notes = prompt('编辑任务备注:', task.notes)
      if (notes !== null) {
        task.notes = notes
        store.dispatch('saveTasks', [...tasks.value])
          .then(() => {
            tasks.value = store.state.tasks
          })
          .catch(error => {
            console.error('保存备注失败:', error)
            alert('保存备注失败，请重试')
          })
      }
    }

    const deleteTask = async (taskId) => {
      if (!confirm('确定要删除这个任务吗？')) return
      const updatedTasks = tasks.value.filter(t => t.id !== taskId)
      try {
        await store.dispatch('saveTasks', updatedTasks)
        tasks.value = store.state.tasks
      } catch (error) {
        console.error('删除任务失败:', error)
        alert('删除任务失败，请重试')
      }
    }

    return {
      tasks,
      newTask,
      addTask,
      deleteTask,
      startEdit,
      finishEdit,
      editNotes,
      isValidTask,
      completedTasks,
      inProgressTasks
    }
  }
}
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-stats {
  display: flex;
  gap: 20px;
}

.task-stats span {
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.9em;
}

.task-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #42b983;
}

.textarea {
  min-height: 60px;
  resize: vertical;
}

.input, .select {
  padding: 10px 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  outline: none;
  transition: all 0.3s ease;
  width: 100%;
}

.task-name {
  cursor: pointer;
}

.notes {
  cursor: pointer;
  color: #999;
  font-size: 0.9em;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notes:hover {
  color: #42b983;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #42b983;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.btn-danger {
  background: #ff6b6b;
}

.table-container {
  overflow-x: auto;
}

.task-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
}

.task-table th {
  padding: 15px;
  text-align: left;
  color: #42b983;
}

.task-table td {
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
}

.task-table tr td:first-child {
  border-radius: 8px 0 0 8px;
}

.task-table tr td:last-child {
  border-radius: 0 8px 8px 0;
}

.priority {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.priority.高 {
  background: #ff6b6b;
}

.priority.中 {
  background: #ffd93d;
  color: #333;
}

.priority.低 {
  background: #6c5ce7;
}

.progress-bar {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  height: 20px;
  position: relative;
  overflow: hidden;
}

.progress {
  background: #42b983;
  height: 100%;
  transition: width 0.3s ease;
}

.progress-bar span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8em;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn:disabled:hover {
  box-shadow: none;
  transform: none;
}

/* 添加输入验证的视觉反馈 */
.input:invalid {
  border-color: #ff6b6b;
}

.input:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}
</style> 