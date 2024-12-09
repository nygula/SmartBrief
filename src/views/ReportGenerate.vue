<template>
  <div class="report-generate">
    <div class="card">
      <h2>生成报告</h2>
      
      <div class="form-group">
        <label>Git项目路径</label>
        <div class="project-config">
          <input type="text" v-model="projectPath" placeholder="选择Git项目路径" readonly />
          <button @click="selectProject" class="btn">选择项目</button>
        </div>
      </div>

      <div class="form-group">
        <label>时间范围</label>
        <div class="date-range">
          <input type="date" v-model="startDate" class="date-input" />
          <span class="date-separator">至</span>
          <input type="date" v-model="endDate" class="date-input" />
        </div>
      </div>

      <div class="form-group">
        <label>报告类型</label>
        <div class="report-type">
          <label class="radio-label">
            <input type="radio" v-model="reportType" value="daily" />
            <span>日报</span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="reportType" value="weekly" />
            <span>周报</span>
          </label>
        </div>
      </div>

      <button class="btn generate-btn" @click="generateReport">
        <span class="icon">📄</span>
        生成报告
      </button>

      <div class="report-preview card" v-if="report">
        <div class="preview-header">
          <h3>报告预览</h3>
          <button class="btn btn-copy" @click="copyReport">复制报告</button>
        </div>
        <pre>{{ report }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import moment from 'moment'

export default {
  name: 'ReportGenerate',
  setup() {
    const store = useStore()
    const projectPath = ref('')
    const startDate = ref(moment().format('YYYY-MM-DD'))
    const endDate = ref(moment().format('YYYY-MM-DD'))
    const reportType = ref('daily')
    const report = ref('')

    const selectProject = async () => {
      const selectedPath = await window.electronAPI.selectDirectory()
      if (selectedPath) {
        projectPath.value = selectedPath
        store.commit('SET_PROJECT_PATH', selectedPath)
      }
    }

    const generateReport = async () => {
      await store.dispatch('fetchGitLogs', {
        startDate: startDate.value,
        endDate: endDate.value
      })

      const tasks = store.state.tasks
      const gitLogs = store.state.gitLogs

      // 根据任务和Git日志生成报告
      let reportContent = `${reportType.value === 'daily' ? '日报' : '周报'}\n`
      reportContent += `时间范围：${startDate.value} 至 ${endDate.value}\n\n`
      
      reportContent += '任务完成情况：\n'
      tasks.forEach(task => {
        reportContent += `- ${task.name} (进度: ${task.progress}%)\n`
      })

      reportContent += '\nGit提交记录：\n'
      gitLogs.forEach(log => {
        reportContent += `- ${moment(log.date).format('YYYY-MM-DD HH:mm')} ${log.message}\n`
      })

      report.value = reportContent
    }

    const copyReport = () => {
      if (report.value) {
        navigator.clipboard.writeText(report.value)
          .then(() => alert('报告已复制到剪贴板'))
          .catch(err => console.error('复制失败:', err))
      }
    }

    return {
      projectPath,
      startDate,
      endDate,
      reportType,
      report,
      selectProject,
      generateReport,
      copyReport
    }
  }
}
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: #42b983;
  font-weight: 500;
}

input[type="text"],
input[type="date"],
.btn {
  padding: 12px 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  outline: none;
  transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="date"]:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.project-config {
  display: flex;
  gap: 15px;
}

.project-config input {
  flex: 1;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 15px;
}

.date-separator {
  color: #42b983;
}

.report-type {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  display: none;
}

.radio-label span {
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.radio-label input[type="radio"]:checked + span {
  background: #42b983;
  color: white;
}

.generate-btn {
  width: 100%;
  background: #42b983;
  font-size: 1.1em;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.icon {
  font-size: 1.2em;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.btn-copy {
  background: #6c5ce7;
  font-size: 0.9em;
}

.report-preview pre {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
}
</style> 