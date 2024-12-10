<template>
  <transition name="dialog-fade">
    <div v-if="modelValue" class="settings-dialog">
      <div class="dialog-backdrop" @click="$emit('update:modelValue', false)"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h2>
            <i class="settings-icon-animated"></i>
            系统设置
          </h2>
          <button class="close-button" @click="$emit('update:modelValue', false)">
            <span>×</span>
          </button>
        </div>
        
        <div class="dialog-body">
          <!-- 数据目录设置 -->
          <div class="setting-section">
            <div class="section-header">
              <i class="folder-icon"></i>
              <h3>基础设置</h3>
            </div>
            <div class="setting-item">
              <label>数据保存目录：</label>
              <div class="directory-selector">
                <input 
                  type="text" 
                  v-model="settings.dataDirectory" 
                  readonly 
                  placeholder="请选择数据保存目录"
                >
                <button @click="selectDirectory" class="secondary-button">
                  <i class="folder-open-icon"></i>
                  选择目录
                </button>
              </div>
            </div>
          </div>

          <!-- API 配置部分 -->
          <div class="setting-section">
            <div class="section-header">
              <i class="api-icon"></i>
              <h3>AI 模型配置</h3>
            </div>
            
            <!-- 模型类型选择 -->
            <div class="setting-item with-hover">
              <label>大模型类型：</label>
              <select v-model="settings.api.modelType" class="model-select">
                <option value="chatgpt">ChatGPT</option>
                <option value="doubao">豆包</option>
                <option value="qianwen">通义千问</option>
                <option value="wenxin">文心一言</option>
              </select>
            </div>

            <!-- API 基础信息 -->
            <div class="setting-item with-hover">
              <label>API URL：</label>
              <input 
                type="text" 
                v-model="settings.api.url"
                :placeholder="getUrlPlaceholder"
              >
            </div>

            <div class="setting-item with-hover">
              <label>API Key：</label>
              <input 
                type="password" 
                v-model="settings.api.apiKey"
                placeholder="请输入 API Key"
              >
            </div>

            <div class="setting-item with-hover">
              <label>模型名称：</label>
              <input 
                type="text" 
                v-model="settings.api.modelName"
                :placeholder="getModelNamePlaceholder"
              >
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button @click="$emit('update:modelValue', false)" class="secondary-button">
            取消
          </button>
          <button @click="saveSettings" class="primary-button">
            <i class="save-icon"></i>
            保存设置
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'SettingsDialog',
  props: {
    modelValue: Boolean
  },
  
  data() {
    return {
      settings: {
        dataDirectory: '',
        api: {
          modelType: 'chatgpt',
          url: '',
          apiKey: '',
          modelName: ''
        }
      }
    }
  },
  
  async mounted() {
    try {
      // 加载设置
      const settings = await window.electronAPI.loadSettings()
      if (settings) {
        this.settings = {
          dataDirectory: settings.dataDirectory || '',
          api: {
            modelType: settings.api?.modelType || 'chatgpt',
            url: settings.api?.url || '',
            apiKey: settings.api?.apiKey || '',
            modelName: settings.api?.modelName || ''
          }
        }
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  },
  
  methods: {
    async selectDirectory() {
      try {
        const directory = await window.electronAPI.selectDirectory()
        if (directory) {
          this.settings.dataDirectory = directory
        }
      } catch (error) {
        console.error('选择目录失败:', error)
        alert('选择目录失败: ' + error.message)
      }
    },
    
    async saveSettings() {
      try {
        await window.electronAPI.saveSettings(this.settings)
        this.$emit('settings-saved', this.settings)
        this.$emit('update:modelValue', false)
        alert('设置已保存')
      } catch (error) {
        console.error('保存设置失败:', error)
        alert('保存设置失败: ' + error.message)
      }
    }
  }
}
</script>

<style scoped>
:root {
  --primary-color: #333;
  --primary-light: #444;
  --accent-color: #666;
  --text-color: #e0e0e0;
  --border-color: #555;
  --hover-color: #3a3a3a;
  --danger-color: #ff4444;
  --input-bg: #2a2a2a;
}

.settings-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
}

.dialog-content {
  position: relative;
  background: #222;
  border-radius: 16px;
  width: 700px;
  max-height: 85vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: dialog-slide-in 0.3s ease-out;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.dialog-header {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.dialog-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #646cff 25%, 
    #a855f7 50%, 
    #646cff 75%, 
    transparent 100%
  );
  animation: shine 3s linear infinite;
}

@keyframes shine {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.5em;
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(90deg, #646cff, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(164, 85, 247, 0.3);
}

.dialog-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  background: #222;
}

.dialog-footer {
  padding: 15px 20px;
  background: #1a1a1a;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.section-header h3 {
  color: var(--text-color);
  margin: 0;
  font-size: 1.2em;
}

.setting-item {
  margin: 20px 0;
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 15px;
}

.setting-item.with-hover:hover {
  background: var(--hover-color);
  transform: translateX(5px);
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-color);
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 10px;
  background: var(--input-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  color: var(--text-color);
}

input:focus, textarea:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 102, 102, 0.1);
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.close-button:hover {
  opacity: 1;
  transform: rotate(90deg);
}

.primary-button, .secondary-button, .add-button {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.primary-button {
  background: linear-gradient(135deg, #646cff 0%, #a855f7 100%);
  color: var(--text-color);
  border: none;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.primary-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #a855f7 0%, #646cff 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.primary-button:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(100, 108, 255, 0.4);
}

.primary-button:hover::before {
  opacity: 1;
}

.secondary-button {
  background: transparent;
  color: var(--text-color);
  border: 2px solid #646cff;
  position: relative;
  overflow: hidden;
}

.secondary-button:hover {
  background: rgba(100, 108, 255, 0.1);
  transform: translateY(-2px);
  border-color: #a855f7;
  box-shadow: 0 0 15px rgba(100, 108, 255, 0.2);
}

.add-button {
  background: transparent;
  border: 2px dashed var(--border-color);
  color: var(--text-color);
  margin-top: 10px;
  width: fit-content;
}

.add-button:hover {
  background: var(--hover-color);
  transform: translateY(-2px);
}

.delete-button {
  padding: 0 12px;
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background: #ff2020;
  transform: scale(1.1);
}

/* 动画效果 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@keyframes dialog-slide-in {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 图标样式 */
.settings-icon-animated {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.65.07-.97 0-.32-.03-.65-.07-.97l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65c-.04-.24-.25-.42-.5-.42h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.63c-.04.32-.07.65-.07.97 0 .32.03.65.07.97l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.63z"/></svg>');
  filter: drop-shadow(0 0 2px #646cff);
}

.folder-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e0e0e0"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>');
}

.api-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e0e0e0"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>');
}

.plus-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e0e0e0"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>');
}

.save-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e0e0e0"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>');
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 修改滚动条样式 */
.dialog-body::-webkit-scrollbar {
  width: 8px;
}

.dialog-body::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.dialog-body::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

.dialog-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 输入框占位符颜色 */
input::placeholder,
textarea::placeholder {
  color: #666;
}

/* 选中文本的颜色 */
input::selection,
textarea::selection {
  background: #666;
  color: #fff;
}

/* 给输入框和按钮添加暗色主题的光晕效果 */
.primary-button:hover,
.secondary-button:hover,
.add-button:hover {
  box-shadow: 0 0 15px rgba(102, 102, 102, 0.2);
}

input:focus,
textarea:focus {
  box-shadow: 0 0 0 3px rgba(102, 102, 102, 0.2);
}

/* 修改 header-item 和 param-item 的样式 */
.header-item,
.param-item {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.header-input,
.param-input {
  flex: 1;
  width: auto; /* 覆盖之前的 width: 100% */
}

/* 为了让删除按钮垂直居中 */
.delete-button {
  align-self: center;
  height: 100%;
  min-height: 42px; /* 与输入框高度保持一致 */
  display: flex;
  align-items: center;
}

/* 调整容器样式 */
.headers-container,
.params-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 添加下拉框样式 */
.model-select {
  width: 100%;
  padding: 10px;
  background: var(--input-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
}

.model-select:focus {
  border-color: var(--accent-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 102, 102, 0.1);
}
</style> 