<template>
  <div class="project-config-container">
    <div class="section-title">
      <i class="project-icon"></i>
      <h2>项目配置</h2>
    </div>

    <div class="projects-list">
      <div v-for="(project, index) in projects" :key="index" class="project-item">
        <div class="project-header">
          <div class="directory-input">
            <div class="path-display" :title="project.path">
              <span class="path-text">{{ formatPath(project.path) }}</span>
              <div class="path-tooltip">{{ project.path }}</div>
            </div>
            <button class="delete-btn" @click="removeProject(index)" title="删除项目">
              删除
            </button>
          </div>
        </div>
        <div class="project-dates">
          <div class="date-range">
            <div class="datetime-input">
              <input 
                type="date" 
                v-model="project.startDate"
                @change="(e) => handleProjectDateChange(index, 'start', e)"
              />
              <input 
                type="time" 
                v-model="project.startTime" 
                @change="(e) => handleProjectTimeChange(index, 'start', e)"
              />
            </div>
            <span class="date-separator">至</span>
            <div class="datetime-input">
              <input 
                type="date" 
                v-model="project.endDate"
                @change="(e) => handleProjectDateChange(index, 'end', e)"
              />
              <input 
                type="time" 
                v-model="project.endTime"
                @change="(e) => handleProjectTimeChange(index, 'end', e)"
              />
            </div>
          </div>
        </div>
      </div>
      <button class="add-project-btn" @click="openDirectoryDialog">
        <i class="add-icon"></i>
        添加项目
      </button>
    </div>
  </div>
</template>

<script>
import { dataService } from "../services/dataService";

export default {
  name: "ProjectConfig",
  data() {
    return {
      projects: [],
      saveTimeout: null
    };
  },
  methods: {
    formatPath(path) {
      if (!path) return "";
      const parts = path.split(/[/\\]/);
      if (parts.length <= 3) return path;
      let start = parts[0].includes(":") ? parts[0] + "\\" : "/";
      let end = parts.slice(-2).join("/");
      return `${start}/.../${end}`;
    },
    async openDirectoryDialog() {
      try {
        const directory = await window.electronAPI.selectDirectory();
        if (directory && !this.projects.some((p) => p.path === directory)) {
          this.projects.push({
            path: directory,
            startDate: new Date().toISOString().split('T')[0],
            startTime: '00:00',
            endDate: new Date().toISOString().split('T')[0],
            endTime: '23:59'
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
    handleProjectTimeChange(projectIndex, type, event) {
      const value = event.target.value;
      const project = this.projects[projectIndex];
      
      if (type === 'start') {
        project.startTime = value;
      } else {
        project.endTime = value;
      }
    },
    async saveProjectConfig() {
      try {
        await dataService.saveProjectConfig(this.projects);
      } catch (error) {
        console.error("保存项目配置失败:", error);
      }
    },
    async loadProjectConfig() {
      try {
        const config = await dataService.loadProjectConfig();
        if (config && Array.isArray(config)) {
          this.projects = config;
        }
      } catch (error) {
        console.error("加载项目配置失败:", error);
      }
    },
  },
  async mounted() {
    await this.loadProjectConfig();
  },
  watch: {
    projects: {
      deep: true,
      handler() {
        if (this.saveTimeout) {
          clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
          this.saveProjectConfig();
        }, 300);
      },
    },
  },
  beforeUnmount() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
  }
};
</script>

<style scoped>
.project-config-container {
  padding: 20px;
  background: var(--bg-dark);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
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
  position: relative;
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

.delete-btn {
  padding: 6px 16px;
  border: 1px solid #ff3b30;
  border-radius: 6px;
  background: transparent;
  color: #ff3b30;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #ff3b30;
  color: white;
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

.add-icon {
  width: 14px;
  height: 14px;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>');
}

.project-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>');
}

.datetime-input {
  display: flex;
  gap: 8px;
}

.datetime-input input[type="time"] {
  width: 120px;
  padding: 10px 16px;
  background: var(--input-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-light);
  font-size: 0.9em;
}
</style> 