<template>
  <div v-if="modelValue" class="settings-dialog">
    <div class="dialog-content">
      <h2>系统设置</h2>
      
      <!-- 数据目录设置 -->
      <div class="setting-section">
        <h3>基础设置</h3>
        <div class="setting-item">
          <label>数据保存目录：</label>
          <div class="directory-selector">
            <input 
              type="text" 
              v-model="settings.dataDirectory" 
              readonly 
              placeholder="请选择数据保存目录"
            >
            <button @click="selectDirectory" class="secondary-button">选择目录</button>
          </div>
        </div>
      </div>

      <!-- API 配置部分 -->
      <div class="setting-section">
        <h3>AI 模型配置</h3>
        
        <!-- API 基础信息 -->
        <div class="setting-item">
          <label>API 名称：</label>
          <input 
            type="text" 
            v-model="settings.api.name"
            placeholder="例如：ChatGPT API"
          >
        </div>

        <div class="setting-item">
          <label>请求 URL：</label>
          <input 
            type="text" 
            v-model="settings.api.url"
            placeholder="输入完整的 API URL"
          >
        </div>

        <!-- Headers 配置 -->
        <div class="setting-item">
          <label>Headers：</label>
          <div class="headers-container">
            <div v-for="(header, index) in settings.api.headers" 
                 :key="index" 
                 class="header-item">
              <input 
                type="text" 
                v-model="header.key"
                placeholder="Key"
                class="header-input"
              >
              <input 
                type="text" 
                v-model="header.value"
                placeholder="Value"
                class="header-input"
              >
              <button 
                @click="removeHeader(index)"
                class="delete-button"
              >×</button>
            </div>
            <button 
              @click="addHeader"
              class="secondary-button add-button"
            >添加 Header</button>
          </div>
        </div>

        <!-- Parameters 配置 -->
        <div class="setting-item">
          <label>Parameters：</label>
          <div class="params-container">
            <div v-for="(param, index) in settings.api.parameters" 
                 :key="index" 
                 class="param-item">
              <input 
                type="text" 
                v-model="param.key"
                placeholder="Key"
                class="param-input"
              >
              <input 
                type="text" 
                v-model="param.value"
                placeholder="Value"
                class="param-input"
              >
              <button 
                @click="removeParam(index)"
                class="delete-button"
              >×</button>
            </div>
            <button 
              @click="addParam"
              class="secondary-button add-button"
            >添加 Parameter</button>
          </div>
        </div>

        <!-- Request Body 配置 -->
        <div class="setting-item">
          <label>Request Body：</label>
          <textarea 
            v-model="settings.api.body"
            placeholder="输入 JSON 格式的请求体"
            rows="5"
            class="body-input"
          ></textarea>
        </div>
      </div>

      <div class="dialog-actions">
        <button @click="saveSettings" class="primary-button">保存</button>
        <button @click="$emit('update:modelValue', false)" class="secondary-button">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsDialog',
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue', 'settings-saved'],
  
  data() {
    return {
      settings: {
        dataDirectory: '',
        api: {
          name: '',
          url: '',
          headers: [],
          parameters: [],
          body: ''
        }
      }
    }
  },

  methods: {
    async selectDirectory() {
      try {
        const directory = await window.electronAPI.selectDirectory()
        if (directory) {
          this.settings.dataDirectory = directory
        }
      } catch (err) {
        alert(`选择目录失败: ${err.message}`)
      }
    },

    addHeader() {
      this.settings.api.headers.push({ key: '', value: '' })
    },

    removeHeader(index) {
      this.settings.api.headers.splice(index, 1)
    },

    addParam() {
      this.settings.api.parameters.push({ key: '', value: '' })
    },

    removeParam(index) {
      this.settings.api.parameters.splice(index, 1)
    },

    validateSettings() {
      if (!this.settings.dataDirectory) {
        throw new Error('请选择数据保存目录')
      }
      if (!this.settings.api.url) {
        throw new Error('请输入 API URL')
      }
      if (this.settings.api.body) {
        try {
          JSON.parse(this.settings.api.body)
        } catch (e) {
          throw new Error('Request Body 必须是有效的 JSON 格式')
        }
      }
    },

    async saveSettings() {
      try {
        this.validateSettings()
        await window.electronAPI.saveSettings(this.settings)
        this.$emit('settings-saved', this.settings)
        this.$emit('update:modelValue', false)
      } catch (err) {
        alert(err.message || '保存设置失败')
      }
    }
  },

  async mounted() {
    try {
      const savedSettings = await window.electronAPI.loadSettings()
      if (savedSettings) {
        this.settings = {
          ...this.settings,
          ...savedSettings,
          api: {
            ...this.settings.api,
            ...savedSettings.api
          }
        }
      }
    } catch (err) {
      console.error('加载设置失败:', err)
    }
  }
}
</script>

<style scoped>
.settings-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.setting-section {
  margin-bottom: 24px;
}

.setting-section h3 {
  color: #42b983;
  margin-bottom: 16px;
  font-size: 1.1em;
}

.setting-item {
  margin: 15px 0;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
}

.directory-selector {
  display: flex;
  gap: 10px;
}

input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.headers-container, .params-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-item, .param-item {
  display: flex;
  gap: 8px;
}

.header-input, .param-input {
  flex: 1;
}

.delete-button {
  padding: 0 10px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-button {
  margin-top: 8px;
  align-self: flex-start;
}

.dialog-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.primary-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #42b983;
  color: white;
  cursor: pointer;
}

.secondary-button {
  padding: 8px 16px;
  border: 1px solid #42b983;
  border-radius: 4px;
  background: white;
  color: #42b983;
  cursor: pointer;
}

.primary-button:hover {
  background: #3aa876;
}

.secondary-button:hover {
  background: #f0f9f6;
}

.body-input {
  font-family: monospace;
}
</style> 