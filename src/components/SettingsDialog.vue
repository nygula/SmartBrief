<template>
  <div class="settings-overlay" v-if="modelValue" @click="close">
    <div class="settings-dialog" @click.stop>
      <div class="settings-header">
        <h2>系统设置</h2>
        <button class="close-button" @click="close">×</button>
      </div>
      
      <div class="settings-content">
        <div class="settings-section">
          <h3>报告配置</h3>
          <div class="form-item">
            <label>报告存储目录</label>
            <div class="directory-input">
              <input 
                type="text" 
                v-model="settings.reportDir" 
                placeholder="请选择报告存储目录"
                readonly
              >
              <button @click="selectDirectory">选择目录</button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>AI模型配置</h3>
          <div class="form-item">
            <label>API类型</label>
            <select v-model="settings.apiType">
              <option value="openai">OpenAI</option>
              <option value="azure">Azure OpenAI</option>
              <option value="anthropic">Anthropic Claude</option>
            </select>
          </div>
          
          <div class="form-item">
            <label>API URL</label>
            <input 
              type="text" 
              v-model="settings.apiUrl" 
              placeholder="请输入API地址"
            >
          </div>
          
          <div class="form-item">
            <label>API Key</label>
            <input 
              type="password" 
              v-model="settings.apiKey" 
              placeholder="请输入API密钥"
            >
          </div>

          <div class="form-item">
            <label>模型名称</label>
            <input 
              type="text" 
              v-model="settings.modelName" 
              placeholder="例如: gpt-4-turbo-preview"
            >
          </div>
        </div>
      </div>

      <div class="settings-footer">
        <button class="cancel-button" @click="close">取消</button>
        <button class="save-button" @click="saveSettings">保存</button>
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
  data() {
    return {
      settings: {
        reportDir: '',
        apiType: 'openai',
        apiUrl: '',
        apiKey: '',
        modelName: ''
      }
    }
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
    },
    async selectDirectory() {
      try {
        // 使用electron的dialog来选择目录
        const result = await window.electron.showDirectoryPicker()
        if (result) {
          this.settings.reportDir = result
        }
      } catch (error) {
        console.error('选择目录失败:', error)
      }
    },
    async saveSettings() {
      try {
        // 保存设置到本地存储
        await window.electron.saveSettings(this.settings)
        this.$emit('settings-saved', this.settings)
        this.close()
      } catch (error) {
        console.error('保存设置失败:', error)
      }
    },
    async loadSettings() {
      try {
        // 从本地存储加载设置
        const savedSettings = await window.electron.loadSettings()
        if (savedSettings) {
          this.settings = { ...this.settings, ...savedSettings }
        }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    }
  },
  mounted() {
    this.loadSettings()
  }
}
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.settings-dialog {
  background: white;
  border-radius: 8px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.settings-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.settings-content {
  padding: 20px;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section h3 {
  color: #42b983;
  margin-bottom: 16px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
}

.form-item input,
.form-item select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.directory-input {
  display: flex;
  gap: 8px;
}

.directory-input input {
  flex: 1;
}

.directory-input button {
  white-space: nowrap;
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.settings-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.settings-footer button {
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-button {
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #666;
}

.save-button {
  background: #42b983;
  border: 1px solid #42b983;
  color: white;
}

.save-button:hover {
  background: #3aa876;
}
</style> 