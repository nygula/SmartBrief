<template>
  <div class="report-container">
    <!-- 报告配置区域 -->
    <div class="config-section">
      <div class="section-title">
        <i class="report-icon"></i>
        <h2>报告配置</h2>
      </div>

      <div class="report-type-selector">
        <label>报告类型</label>
        <select v-model="config.reportType">
          <option value="daily">日报</option>
          <option value="weekly">周报</option>
          <option value="monthly">月报</option>
          <option value="custom">自定义</option>
        </select>
      </div>

      <div class="projects-config">
        <label>项目配置</label>
        <div class="projects-list">
          <div v-for="(project, index) in projects" :key="index" class="project-item">
            <div class="project-header">
              <div class="directory-input">
                <input type="text" :value="project.path" readonly>
                <button class="remove-button" @click="removeProject(index)">
                  <i class="remove-icon"></i>
                </button>
              </div>
            </div>
            <div class="project-dates">
              <div class="date-range">
                <input 
                  type="date" 
                  v-model="project.startDate"
                  @change="e => handleProjectDateChange(index, 'start', e)"
                >
                <span class="date-separator">至</span>
                <input 
                  type="date" 
                  v-model="project.endDate"
                  @change="e => handleProjectDateChange(index, 'end', e)"
                >
              </div>
            </div>
          </div>
          <button class="add-project-btn" @click="openDirectoryDialog">
            <i class="add-icon"></i>
            添加项目
          </button>
        </div>
      </div>

      <div class="input-group">
        <label>包含内容</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="config.includeCommits">
            <span>代码提交</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="config.includeTasks">
            <span>任务进度</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="config.includeStats">
            <span>统计数据</span>
          </label>
        </div>
      </div>
    </div>

    <!-- AI 分析配置 -->
    <div class="ai-section">
      <div class="section-title">
        <i class="ai-icon"></i>
        <h2>AI 分析配置</h2>
      </div>

      <div class="ai-options">
        <div class="input-group">
          <label>分析深度</label>
          <select v-model="config.aiDepth">
            <option value="basic">基础分析</option>
            <option value="detailed">详细分析</option>
            <option value="comprehensive">全面分析</option>
          </select>
        </div>

        <div class="input-group">
          <label>关注点</label>
          <div class="tag-selector">
            <div 
              v-for="tag in availableTags" 
              :key="tag.id"
              :class="['tag', { active: selectedTags.includes(tag.id) }]"
              @click="toggleTag(tag.id)"
            >
              {{ tag.name }}
            </div>
          </div>
        </div>

        <div class="input-group full-width">
          <label>自定义提示词</label>
          <textarea 
            v-model="config.customPrompt"
            placeholder="输入自定义的 AI 分析提示词"
            rows="3"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button class="preview-button" @click="previewReport">
        <i class="preview-icon"></i>
        预览报告
      </button>
      <button class="generate-button" @click="generateReport">
        <i class="generate-icon"></i>
        生成报告
      </button>
    </div>

    <!-- 生成进度 -->
    <div v-if="isGenerating" class="generation-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: generationProgress + '%' }"
        ></div>
      </div>
      <div class="progress-status">
        {{ progressStatus }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportGenerate',
  data() {
    return {
      config: {
        reportType: 'weekly',
        includeCommits: true,
        includeTasks: true,
        includeStats: true,
        aiDepth: 'detailed',
        customPrompt: ''
      },
      projects: [],
      availableTags: [
        { id: 1, name: '代码质量' },
        { id: 2, name: '进度分析' },
        { id: 3, name: '性能优化' },
        { id: 4, name: '安全性' },
        { id: 5, name: '最佳实践' }
      ],
      selectedTags: [1, 2],
      isGenerating: false,
      generationProgress: 0,
      progressStatus: ''
    }
  },
  methods: {
    toggleTag(tagId) {
      const index = this.selectedTags.indexOf(tagId)
      if (index === -1) {
        this.selectedTags.push(tagId)
      } else {
        this.selectedTags.splice(index, 1)
      }
    },
    async previewReport() {
      // 实现预览逻辑
    },
    async generateReport() {
      this.isGenerating = true
      this.generationProgress = 0
      this.progressStatus = '正在收集数据...'

      // 模拟生成过程
      await this.simulateProgress()

      this.isGenerating = false
      // 实际生成逻辑
    },
    async simulateProgress() {
      const steps = [
        { progress: 20, status: '分析代码提交...' },
        { progress: 40, status: '处理任务数据...' },
        { progress: 60, status: '生成统计图表...' },
        { progress: 80, status: 'AI 分析中...' },
        { progress: 100, status: '报告生成完成！' }
      ]

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.generationProgress = step.progress
        this.progressStatus = step.status
      }
    },
    async openDirectoryDialog() {
      try {
        if (!window.electronAPI?.selectDirectory) {
          throw new Error('选择目录功能不可用')
        }
        
        const directory = await window.electronAPI.selectDirectory()
        if (directory && !this.projects.some(p => p.path === directory)) {
          this.projects.push({
            path: directory,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          })
        }
      } catch (error) {
        console.error('选择目录失败:', error)
      }
    },
    removeProject(index) {
      this.projects.splice(index, 1)
    },
    handleProjectDateChange(projectIndex, type, event) {
      const value = event.target.value
      const project = this.projects[projectIndex]
      
      if (type === 'start') {
        project.startDate = value
        if (project.endDate < value) {
          project.endDate = value
        }
      } else {
        project.endDate = value
        if (project.startDate > value) {
          project.startDate = value
        }
      }
    }
  }
}
</script>

<style scoped>
.report-container {
  padding: 20px;
  background: var(--bg-dark);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.section-title h2 {
  margin: 0;
  font-size: 1.5em;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(100, 108, 255, 0.3);
}

.config-section, .ai-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group.full-width {
  grid-column: 1 / -1;
}

label {
  color: var(--text-light);
  font-size: 0.9em;
}

input, select, textarea {
  padding: 10px;
  background: var(--input-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-light);
  transition: all 0.3s ease;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
  outline: none;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-separator {
  color: var(--text-light);
}

.checkbox-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(100, 108, 255, 0.1);
  border: 1px solid var(--border-color);
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag:hover {
  background: rgba(100, 108, 255, 0.2);
  transform: translateY(-2px);
}

.tag.active {
  background: var(--primary-gradient);
  color: white;
  border: none;
  box-shadow: 0 0 10px rgba(100, 108, 255, 0.3);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.preview-button, .generate-button {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.preview-button {
  background: transparent;
  color: var(--text-light);
  border: 2px solid var(--primary-color);
}

.generate-button {
  background: var(--primary-gradient);
  color: white;
  border: none;
}

.preview-button:hover, .generate-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(100, 108, 255, 0.3);
}

.generation-progress {
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: var(--primary-gradient);
  transition: width 0.3s ease;
}

.progress-status {
  text-align: center;
  color: var(--text-light);
  font-size: 0.9em;
}

/* 图标样式 */
.report-icon, .ai-icon, .preview-icon, .generate-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 0 2px var(--primary-color));
}

.report-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>');
}

.ai-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M21 11.5v-1c0-.8-.7-1.5-1.5-1.5H16v-3c0-.8-.7-1.5-1.5-1.5h-1c-.8 0-1.5.7-1.5 1.5v3h-2v-3c0-.8-.7-1.5-1.5-1.5h-1c-.8 0-1.5.7-1.5 1.5v3H4.5C3.7 9 3 9.7 3 10.5v1c0 .8.7 1.5 1.5 1.5h3v2h-3c-.8 0-1.5.7-1.5 1.5v1c0 .8.7 1.5 1.5 1.5H6v3c0 .8.7 1.5 1.5 1.5h1c.8 0 1.5-.7 1.5-1.5v-3h2v3c0 .8.7 1.5 1.5 1.5h1c.8 0 1.5-.7 1.5-1.5v-3h1.5c.8 0 1.5-.7 1.5-1.5v-1c0-.8-.7-1.5-1.5-1.5h-3v-2h3c.8 0 1.5-.7 1.5-1.5z"/></svg>');
}

.preview-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>');
}

.generate-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>');
}

.directory-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.directory-item {
  display: flex;
  gap: 10px;
}

.directory-item input {
  flex: 1;
  cursor: default;
}

.remove-button {
  padding: 8px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-button:hover {
  background: rgba(255, 59, 48, 0.2);
}

.add-project-btn {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--primary-gradient);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-project-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 108, 255, 0.3);
}

.add-project-btn .add-icon {
  width: 14px;
  height: 14px;
}

.date-range input[type="date"] {
  padding: 8px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-light);
  cursor: pointer;
}

.date-range input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  cursor: pointer;
}

.report-type-selector {
  margin-bottom: 20px;
  max-width: 200px;
}

.projects-config {
  margin-top: 20px;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid var(--border-color);
}

.project-header {
  margin-bottom: 10px;
}

.directory-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.project-dates {
  margin-top: 10px;
}
</style> 