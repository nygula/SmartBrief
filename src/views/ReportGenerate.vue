<template>
  <div class="report-container">
    <div class="report-header">
      <!-- 报告类型选择 -->
      <div class="report-type-selector">
        <div 
          v-for="type in reportTypes" 
          :key="type.value"
          :class="['type-item', { active: config.reportType === type.value }]"
          @click="config.reportType = type.value"
        >
          <i :class="type.icon"></i>
          <span>{{ type.label }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button
          class="preview-button"
          @click="previewReport"
          :disabled="isPreviewLoading"
        >
          <template v-if="!isPreviewLoading">
            <i class="preview-icon"></i>
            预览报告
          </template>
          <template v-else>
            <i class="loading-icon"></i>
            生成中...
          </template>
        </button>
        <button class="generate-button" @click="generateReport">
          <i class="generate-icon"></i>
          生成报告
        </button>
      </div>
    </div>

    <!-- 项目信息展示区域 -->
    <div class="info-section">
      <div class="section-title">
        <i class="info-icon"></i>
        <h2>项目信息</h2>
      </div>
      <div class="projects-info">
        <div v-for="(project, index) in projects" :key="index" class="project-info-item">
          <div class="project-path">{{ formatPath(project.path) }}</div>
          <div class="project-period">
            {{ project.startDate }} 至 {{ project.endDate }}
          </div>
        </div>
      </div>
    </div>

    <!-- 任务数据展示区域 -->
    <div class="task-section">
      <div class="section-title">
        <i class="task-icon"></i>
        <h2>任务数据</h2>
      </div>
      <div class="tasks-info">
        <div v-for="task in tasks" :key="task.id" class="task-info-item">
          <div class="task-name">{{ task.name }}</div>
          <div class="task-details">
            <span class="task-priority">优先级: {{ task.priority }}</span>
            <span class="task-progress">进度: {{ task.progress }}%</span>
          </div>
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

    <LoadingDialog
      v-model="showLoading"
      :title="loadingTitle"
      :message="loadingMessage"
      :progress="generationProgress"
      :show-progress="isGenerating"
    />

    <ReportPreviewDialog v-model="showPreview" :content="previewContent" />

    <SuccessDialog v-model="showSuccessDialog" :file-path="generatedFilePath" />
  </div>
</template>

<script>
import { dataService } from "../services/dataService";
import { EventBus } from "../eventBus";
import { aiManager } from "../services/ai/AIServiceFactory";
import ReportPreviewDialog from "../components/ReportPreviewDialog.vue";
import SuccessDialog from "../components/SuccessDialog.vue";
import { ElMessageBox } from "element-plus";
import { formatDate } from "../utils/dateUtils";
import LoadingDialog from "../components/LoadingDialog.vue";

export default {
  name: "ReportGenerate",
  components: {
    ReportPreviewDialog,
    SuccessDialog,
    LoadingDialog,
  },
  data() {
    return {
      config: {
        reportType: "weekly",
        includeCommits: true,
        includeTasks: true,
        includeStats: true,
        aiDepth: "detailed",
        customPrompt: "",
      },
      reportTypes: [
        { value: 'daily', label: '日报', icon: 'daily-icon' },
        { value: 'weekly', label: '周报', icon: 'weekly-icon' },
        { value: 'monthly', label: '月报', icon: 'monthly-icon' }
      ],
      projects: [],
      tasks: [],
      availableTags: [
        { id: 1, name: "代码质量" },
        { id: 2, name: "进度分析" },
        { id: 3, name: "性能优化" },
        { id: 4, name: "安全性" },
        { id: 5, name: "最佳实践" },
      ],
      selectedTags: [],
      isGenerating: false,
      generationProgress: 0,
      progressStatus: "",
      showPreview: false,
      previewContent: "",
      isPreviewLoading: false,
      showSuccessDialog: false,
      generatedFilePath: "",
      showLoading: false,
      loadingTitle: '请稍候',
      loadingMessage: '正在处理中...',
    };
  },
  methods: {
    async loadProjectData() {
      try {
        const projectConfig = await dataService.loadProjectConfig();
        if (Array.isArray(projectConfig)) {
          this.projects = projectConfig;
        }
      } catch (error) {
        console.error('加载项目配置失败:', error);
      }
    },

    async loadTaskData() {
      try {
        const tasks = await dataService.loadTaskList();
        this.tasks = tasks;
      } catch (error) {
        console.error('加载任务数据失败:', error);
      }
    },

    toggleTag(tagId) {
      if (!this.selectedTags) {
        this.selectedTags = [];
      }
      const index = this.selectedTags.indexOf(tagId);
      if (index === -1) {
        this.selectedTags.push(tagId);
      } else {
        this.selectedTags.splice(index, 1);
      }
    },
    async generateReportContent() {
      const tasks = await this.getTaskListData();
      const taskText = tasks
        .map(
          (task) =>
            `任务: ${task.name}, 优先级: ${task.priority}, 进度: ${task.progress}%`
        )
        .join("\n");

      const gitLogs = await this.getGitLogs();
      const gitLogText = gitLogs.join("\n");

      const reportTypePrompts = {
        daily: "请将以下内容整理成一份工作日报，突出今日完成的工作内容和进展：",
        weekly: "请将以下内容整理成一份工作周报，总结本周的主要工作成果和进展：",
        monthly: "请将以下内容整理成一份工作月报，系统总结本月的工作重点和成果："
      };

      const reportTypePrompt = reportTypePrompts[this.config.reportType] || reportTypePrompts.weekly;

      const aiConfigText = `
        报告类型: ${this.config.reportType}
        分析深度: ${this.config.aiDepth}
        ${this.config.customPrompt ? `自定义提示词: ${this.config.customPrompt}` : ""}
        ${
          this.selectedTags.length > 0
            ? `关注点: ${this.getSelectedTagNames().join(", ")}`
            : ""
        }
      `.trim();

      const prompt = `
        ${reportTypePrompt}

        === 任务进展 ===
        ${taskText}

        === 代码提交记录 ===
        ${gitLogText}

        === 分析要求 ===
        ${aiConfigText}
      `.trim();

      return await aiManager.generateReport(prompt);
    },

    getSelectedTagNames() {
      return this.selectedTags
        .map(
          (tagId) => this.availableTags.find((tag) => tag.id === tagId)?.name
        )
        .filter(Boolean);
    },

    startGenerationProgress(progressCallback) {
      const steps = [
        { progress: 20, status: "收集项目数据..." },
        { progress: 40, status: "分析代码提交..." },
        { progress: 60, status: "生成报告内容..." },
        { progress: 80, status: "等待 AI 响应..." },
      ];

      let currentStep = 0;

      const updateProgress = () => {
        if (currentStep < steps.length && progressCallback.isLoading) {
          const { progress, status } = steps[currentStep];
          this.generationProgress = progress;
          this.loadingMessage = status;
          currentStep++;
          setTimeout(updateProgress, 800);
        }
      };

      updateProgress();
    },

    async initAIService() {
      try {
        const settings = await window.electronAPI.loadSettings();
        if (!settings || !settings.api) {
          throw new Error("未找到 AI 配置");
        }
        aiManager.initializeService(settings);
      } catch (error) {
        console.error("初始化 AI 服务失败:", error);
        throw error;
      }
    },

    async previewReport() {
      if (this.isPreviewLoading) return;

      this.isPreviewLoading = true;
      this.showLoading = true;
      this.loadingTitle = '生成预览';
      this.loadingMessage = '正在生成报告预览...';
      this.isGenerating = true;
      this.generationProgress = 0;

      try {
        await this.initAIService();

        this.startGenerationProgress({ isLoading: this.isPreviewLoading });
        const reportContent = await this.generateReportContent();
        this.previewContent = reportContent;
        this.showPreview = true;
      } catch (error) {
        console.error("预览报告失败:", error);
        ElMessageBox.alert(error.message, "错误", {
          type: "error",
        });
      } finally {
        this.isPreviewLoading = false;
        this.isGenerating = false;
        this.generationProgress = 0;
        this.progressStatus = "";
        this.showLoading = false;
      }
    },

    async generateReport() {
      if (this.isGenerating) return;

      this.isGenerating = true;
      this.showLoading = true;
      this.loadingTitle = '生成报告';
      this.loadingMessage = '正在处理中...';
      this.generationProgress = 0;

      try {
        this.startGenerationProgress({ isLoading: this.isGenerating });
        const reportContent = await this.generateReportContent();

        const timestamp = formatDate(new Date(), "yyyy-MM-dd-HHmmss");
        const fileName = `生成报告_${timestamp}.txt`;

        const result = await window.electronAPI.saveReport({
          content: reportContent,
          fileName: fileName,
        });

        if (result.success) {
          this.generatedFilePath = result.filePath;
          this.showSuccessDialog = true;
        } else {
          throw new Error(result.error || "保存文件失败");
        }
      } catch (error) {
        console.error("生成报告失败:", error);
        ElMessageBox.alert(error.message, "错误", {
          type: "error",
        });
      } finally {
        this.isGenerating = false;
        this.generationProgress = 0;
        this.progressStatus = "";
        this.showLoading = false;
      }
    },

    async getTaskListData() {
      return this.tasks;
    },

    async getGitLogs() {
      const logs = [];
      for (const project of this.projects) {
        const { startDate, endDate, path, startTime = "00:00", endTime = "23:59" } = project;
        
        // 组合日期和时间
        const startDateTime = `${startDate}T${startTime}:00`;
        const endDateTime = `${endDate}T${endTime}:00`;
        
        console.log("完整开始时间:", startDateTime);
        console.log("完整结束时间:", endDateTime);
        
        const log = await this.runGitCommand(path, startDateTime, endDateTime);
        logs.push(`项目: ${path}\n${log}`);
      }
      return logs;
    },

    async runGitCommand(directory, startDate, endDate) {
      try {
        console.log("开始获取Git提交数据:");
        console.log(`目录: ${directory}`);
        console.log(`开始日期时间: ${startDate}`);
        console.log(`结束日期时间: ${endDate}`);

        if (!window.electronAPI?.executeCommand) {
          console.warn("executeCommand API未定义,使用模拟数据");
          const mockData =
            `模拟的Git日志数据 (${startDate} 至 ${endDate})\n` +
            `2024-03-15 [开发者] 示例提交信息\n` +
            `2024-03-14 [开发者] 另一个示例提交`;
          return mockData;
        }

        // 转换为 ISO 格式的时间戳
        const start = new Date(startDate).toISOString();
        const end = new Date(endDate).toISOString();
        
        const command = `git log --pretty=format:"%ad [%an] %s" --date=iso-strict --since="${start}" --until="${end}"`;

        console.log("执行Git命令:", command);

        const result = await window.electronAPI.executeCommand({
          command,
          cwd: directory,
        });

        if (result.error) {
          console.warn(`Git命令执行警告: ${result.error}`);
          return `获取Git日志出现问题: ${result.error}`;
        }

        return result.output || `该时间段内没有提交记录 (${start} 至 ${end})`;
      } catch (error) {
        console.error("执行Git命令失败:", error);
        return `获取Git日志失败: ${error.message}`;
      }
    },

    async callAIService(taskText, gitLogText, aiConfigText) {
      try {
        const prompt = `${taskText}\n\n${gitLogText}\n\n${aiConfigText}`;
        return await aiManager.generateReport(prompt);
      } catch (error) {
        console.error("AI 服务调用失败:", error);
        throw error;
      }
    },

    async openDirectoryDialog() {
      try {
        if (!window.electronAPI?.selectDirectory) {
          throw new Error("选择目录功能不可用");
        }

        const directory = await window.electronAPI.selectDirectory();
        if (directory && !this.projects.some((p) => p.path === directory)) {
          this.projects.push({
            path: directory,
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
          });
        }
      } catch (error) {
        console.error("选择目录失败:", error);
      }
    },
    removeProject(index) {
      this.projects.splice(index, 1);
    },
    handleProjectDateChange(projectIndex, type, event) {
      const value = event.target.value;
      const project = this.projects[projectIndex];

      if (type === "start") {
        project.startDate = value;
        if (project.endDate < value) {
          project.endDate = value;
        }
      } else {
        project.endDate = value;
        if (project.startDate > value) {
          project.startDate = value;
        }
      }
    },
    formatPath(path) {
      if (!path) return "";
      const parts = path.split(/[/\\]/);
      if (parts.length <= 3) return path;

      let start = parts[0].includes(":") ? parts[0] + "\\" : "/";
      let end = parts.slice(-2).join("/");

      return `${start}/.../${end}`;
    },
    async saveReportConfig() {
      try {
        await dataService.saveReportConfig({
          config: this.config,
          selectedTags: this.selectedTags,
        });
        console.log("报告配置保存");
      } catch (error) {
        console.error("保存报告配置失败:", error);
        throw error;
      }
    },

    async loadReportConfig() {
      try {
        const config = await dataService.loadReportConfig();
        if (config) {
          this.config = config.config || this.config;
          this.selectedTags = config.selectedTags || [];
        }
        console.log("报告配置已加载");
      } catch (error) {
        console.error("加载报告配置失败:", error);
      }
    },
  },

  async mounted() {
    await Promise.all([
      this.loadProjectData(),
      this.loadTaskData(),
      this.loadReportConfig()
    ]);
    try {
      await this.initAIService();
    } catch (error) {
      console.warn("初始化 AI 服务失败，将在使用时重试:", error);
    }
  },

  watch: {
    config: {
      deep: true,
      handler() {
        this.saveReportConfig();
      },
    },
    selectedTags: {
      deep: true,
      handler() {
        this.saveReportConfig();
      },
    },
  },
};
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
  background-clip: text; 
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(100, 108, 255, 0.3);
}

.config-section,
.ai-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 30px;
  margin: 40px 0;
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

input,
select,
textarea {
  padding: 10px;
  background: var(--input-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-light);
  transition: all 0.3s ease;
}

input:focus,
select:focus,
textarea:focus {
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

.preview-button,
.generate-button {
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

.preview-button:hover,
.generate-button:hover {
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

/* ��标样式 */
.report-icon,
.ai-icon,
.preview-icon,
.generate-icon {
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

.delete-btn {
  position: relative;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  isolation: isolate;
}

.delete-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 8px;
  padding: 1px;
  background: linear-gradient(45deg, #646cff, #ff3b30);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.btn-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--text-light);
  opacity: 0.6;
  transition: all 0.2s ease;
}

.delete-btn:hover .btn-content {
  color: #ff3b30;
  opacity: 1;
}

.delete-btn:hover::before {
  background: linear-gradient(45deg, #ff3b30, #646cff);
}

.directory-input {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
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
  display: flex;
  gap: 20px;
  margin-top: 20px;
  padding: 5px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.projects-config {
  margin-top: 20px;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.project-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-header {
  width: 100%;
}

.directory-input {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.path-display {
  flex: 1;
  padding: 12px 16px;
  background: var(--input-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: default;
}

.project-dates {
  width: 100%;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: flex-start;
}

.date-range input[type="date"] {
  padding: 10px 16px;
  width: 180px;
  background: var(--input-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-light);
  font-size: 0.9em;
}

.date-separator {
  color: var(--text-light);
  font-size: 0.9em;
  margin: 0 8px;
}

.add-project-btn {
  align-self: flex-start;
  margin-top: 8px;
}

.path-tooltip {
  max-width: 600px;
  white-space: normal;
  word-break: break-all;
}

.path-display:hover,
.date-range input[type="date"]:hover {
  border-color: var(--primary-color);
}

.date-range input[type="date"]:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
}

.path-text {
  display: block;
  color: var(--text-light);
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.path-tooltip {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  padding: 8px 12px;
  background: #333;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-light);
  font-size: 0.9em;
  word-break: break-all;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  max-width: 400px;
}

.path-tooltip::before {
  content: "";
  position: absolute;
  top: -5px;
  left: 20px;
  width: 10px;
  height: 10px;
  background: #333;
  border-left: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
  transform: rotate(45deg);
}

.path-display:hover .path-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.directory-input {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

/* 确保删除按钮样式保持不变 */
.delete-btn {
  flex-shrink: 0;
}

.ai-options {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 添加加载图标动画 */
.loading-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 禁用状态样式 */
.preview-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.preview-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* 进度条动画 */
.progress-fill {
  transition: width 0.3s ease-in-out;
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

.progress-status {
  text-align: center;
  color: var(--text-light);
  font-size: 0.9em;
  min-height: 20px;
}

/* 修改错误图标大小和位置 */
.el-message {
  z-index: 9999;
}

.el-message .el-message__icon {
  font-size: 16px !important;
  vertical-align: middle;
  margin-right: 8px;
}

/* 确保消息提示框位置正确 */
.el-message-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
}

/* 调整错误消息样式 */
.el-message--error {
  background-color: rgba(245, 108, 108, 0.1);
  border-color: rgba(245, 108, 108, 0.2);
  padding: 12px 20px;
  display: flex;
  align-items: center;
}

/* 确保图标垂直居中 */
.el-message__content {
  display: flex;
  align-items: center;
  line-height: 1.4;
}

/* 添加以下 MessageBox 相关样式 */
:deep(.el-message-box) {
  max-width: 400px;
  padding: 20px;
}

:deep(.el-message-box__header) {
  padding: 15px 20px;
}

:deep(.el-message-box__title) {
  font-size: 16px;
  line-height: 1.5;
}

:deep(.el-message-box__content) {
  padding: 20px;
  font-size: 14px;
}

:deep(.el-message-box__btns) {
  padding: 10px 20px 5px;
}

:deep(.el-message-box__status) {
  position: static;
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
  font-size: 18px !important;
  transform: none;
}

:deep(.el-message-box__message) {
  display: inline-block;
  vertical-align: middle;
  margin-left: 0;
  padding-left: 0;
}

:deep(.el-message-box__status.el-icon) {
  font-size: 18px !important;
  height: auto;
  width: auto;
}

:deep(.el-overlay) {
  background-color: rgba(0, 0, 0, 0.7);
}

/* 添加新的样式 */
.info-section,
.task-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 30px;
  margin: 40px 0;
  border: 1px solid var(--border-color);
}

.projects-info,
.tasks-info {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

/* 自定义滚动条样式 */
.projects-info::-webkit-scrollbar,
.tasks-info::-webkit-scrollbar {
  width: 8px;
}

.projects-info::-webkit-scrollbar-track,
.tasks-info::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.projects-info::-webkit-scrollbar-thumb,
.tasks-info::-webkit-scrollbar-thumb {
  background: var(--primary-gradient);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.projects-info::-webkit-scrollbar-thumb:hover,
.tasks-info::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #a855f7, #646cff);
  border: 2px solid transparent;
  background-clip: padding-box;
}

.project-info-item,
.task-info-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.project-info-item:hover,
.task-info-item:hover {
  transform: translateX(5px);
  background: rgba(255, 255, 255, 0.08);
}

.project-path {
  font-size: 1.1em;
  color: var(--text-light);
  margin-bottom: 8px;
}

.project-period {
  font-size: 0.9em;
  color: var(--text-secondary);
}

.task-name {
  font-size: 1.1em;
  color: var(--text-light);
  margin-bottom: 8px;
}

.task-details {
  display: flex;
  gap: 20px;
  font-size: 0.9em;
  color: var(--text-secondary);
}

.info-icon,
.task-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
}

.info-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>');
}

.task-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>');
}

.report-type-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;
  border: 1px solid var(--border-color);
}

.report-type-selector {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  padding: 5px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.type-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95em;
  font-weight: 500;
}

.type-item:hover {
  background: rgba(100, 108, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(100, 108, 255, 0.2);
}

.type-item.active {
  background: var(--primary-gradient);
  border: none;
  color: white;
  box-shadow: 0 2px 12px rgba(100, 108, 255, 0.3);
}

.type-item i {
  opacity: 0.8;
}

.type-item.active i {
  opacity: 1;
}

.type-icon,
.daily-icon,
.weekly-icon,
.monthly-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
}

.type-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>');
}

.daily-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>');
}

.weekly-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>');
}

.monthly-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/></svg>');
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.report-type-selector {
  display: inline-flex;
  gap: 10px;
  padding: 5px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.type-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85em;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.preview-button,
.generate-button {
  padding: 8px 12px;
  font-size: 0.85em;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preview-button {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-light);
  border: 1px solid var(--border-color);
}

.generate-button {
  background: var(--primary-gradient);
  color: white;
}

.preview-button:hover,
.generate-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(100, 108, 255, 0.2);
}
</style>
