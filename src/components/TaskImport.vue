<template>
  <div class="task-import">
    <div class="import-buttons">
      <button class="preview-button" @click="showExcelDialog">
        <i class="excel-icon"></i>
        导入 Excel
      </button>
      <button class="generate-button" @click="showJsonDialog">
        <i class="json-icon"></i>
        导入 JSON
      </button>
    </div>
    
    <!-- Excel导入弹窗 -->
    <div v-if="showExcel" class="dialog-overlay">
      <div class="dialog-content">
        <div class="dialog-header">
          <div class="header-title">
            <i class="excel-dialog-icon"></i>
            <h3>导入 Excel</h3>
          </div>
          <button class="close-btn" @click="showExcel = false">×</button>
        </div>
        
        <div class="dialog-body">
          <div class="template-section">
            <p class="tip-text">请先下载模板，按照模板格式填写后再上传：</p>
            <button class="download-btn" @click="downloadExcelTemplate">
              <i class="download-icon"></i>
              下载Excel模板
            </button>
          </div>
          
          <div class="upload-section">
            <div 
              class="upload-area"
              @drop.prevent="handleFileDrop($event, 'excel')"
              @dragover.prevent
              @click="triggerFileInput('excel')"
            >
              <i class="upload-icon"></i>
              <p>点击或拖拽文件到此处上传</p>
              <p class="file-name" v-if="selectedFile">已选择: {{ selectedFile.name }}</p>
            </div>
          </div>
        </div>
        
        <div class="dialog-footer">
          <button class="cancel-btn" @click="showExcel = false">取消</button>
          <button 
            class="confirm-btn" 
            :disabled="!selectedFile"
            @click="confirmImport('excel')"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>
    
    <!-- JSON导入弹窗 -->
    <div v-if="showJson" class="dialog-overlay">
      <div class="dialog-content">
        <div class="dialog-header">
          <div class="header-title">
            <i class="json-dialog-icon"></i>
            <h3>导入 JSON</h3>
          </div>
          <button class="close-btn" @click="showJson = false">×</button>
        </div>
        
        <div class="dialog-body">
          <div class="template-section">
            <p class="tip-text">JSON格式示例：</p>
            <pre class="json-template">
{
  "tasks": [
    {
      "name": "任务名称",
      "priority": "高/中/低",
      "hours": 8,
      "progress": 0,
      "notes": "备注信息"
    }
  ]
}</pre>
            <button class="download-btn" @click="downloadJsonTemplate">
              <i class="download-icon"></i>
              下载JSON模板
            </button>
          </div>
          
          <div class="upload-section">
            <div 
              class="upload-area"
              @drop.prevent="handleFileDrop($event, 'json')"
              @dragover.prevent
              @click="triggerFileInput('json')"
            >
              <i class="upload-icon"></i>
              <p>点击或拖拽文件到此处上传</p>
              <p class="file-name" v-if="selectedFile">已选择: {{ selectedFile.name }}</p>
            </div>
          </div>
        </div>
        
        <div class="dialog-footer">
          <button class="cancel-btn" @click="showJson = false">取消</button>
          <button 
            class="confirm-btn" 
            :disabled="!selectedFile"
            @click="confirmImport('json')"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>
    
    <input 
      ref="excelInput"
      type="file" 
      accept=".xlsx,.xls"
      style="display: none"
      @change="handleFileSelect('excel')"
    />
    <input 
      ref="jsonInput"
      type="file" 
      accept=".json"
      style="display: none"
      @change="handleFileSelect('json')"
    />
  </div>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
  name: 'TaskImport',
  data() {
    return {
      showExcel: false,
      showJson: false,
      selectedFile: null,
      importType: null
    }
  },
  methods: {
    showExcelDialog() {
      this.showExcel = true;
      this.selectedFile = null;
    },
    
    showJsonDialog() {
      this.showJson = true;
      this.selectedFile = null;
    },
    
    downloadExcelTemplate() {
      const template = [
        {
          '任务名称': '示例任务',
          '优先级': '中',
          '工时': 8,
          '进度': 0,
          '备注': '备注信息'
        }
      ];
      
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '任务列表');
      XLSX.writeFile(wb, '任务导入模板.xlsx');
    },
    
    downloadJsonTemplate() {
      const template = {
        tasks: [
          {
            name: '示例任务',
            priority: '中',
            hours: 8,
            progress: 0,
            notes: '备注信息'
          }
        ]
      };
      
      const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '任务导入模板.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    triggerFileInput(type) {
      this.importType = type;
      this.$refs[`${type}Input`].click();
    },
    
    handleFileDrop(event, type) {
      const file = event.dataTransfer.files[0];
      if (file) {
        this.handleFile(file, type);
      }
    },
    
    handleFileSelect(type) {
      const file = this.$refs[`${type}Input`].files[0];
      if (file) {
        this.handleFile(file, type);
      }
    },
    
    handleFile(file, type) {
      this.selectedFile = file;
      this.importType = type;
    },
    
    async confirmImport(type) {
      if (!this.selectedFile) return;
      
      try {
        let tasks;
        if (type === 'excel') {
          tasks = await this.parseExcelFile(this.selectedFile);
        } else {
          tasks = await this.parseJsonFile(this.selectedFile);
        }
        
        this.$emit('tasks-imported', tasks);
        this.closeDialog();
      } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败: ' + error.message);
      }
    },
    
    closeDialog() {
      this.showExcel = false;
      this.showJson = false;
      this.selectedFile = null;
      this.importType = null;
    },
    
    async parseExcelFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const workbook = XLSX.read(e.target.result, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(firstSheet);
            resolve(this.convertExcelToTasks(data));
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    },
    
    async parseJsonFile(file) {
      const text = await file.text();
      const data = JSON.parse(text);
      return data.tasks || [];
    },
    
    convertExcelToTasks(data) {
      return data.map(row => ({
        id: Date.now() + Math.random(),
        name: row['任务名称'] || row['name'],
        priority: row['优先级'] || row['priority'] || '中',
        hours: Number(row['工时'] || row['hours']) || 0,
        progress: Number(row['进度'] || row['progress']) || 0,
        notes: row['备注'] || row['notes'] || ''
      }));
    }
  }
}
</script>

<style scoped>
.task-import {
  margin: 20px 0;
}

.import-buttons {
  display: flex;
  gap: 12px;
}

.preview-button,
.generate-button {
  padding: 12px 24px;
  font-size: 0.95em;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  justify-content: center;
  font-weight: 500;
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

.excel-icon,
.json-icon {
  width: 20px;
  height: 20px;
  opacity: 0.9;
}

.excel-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM7 15h2v2H7v-2zm8 0h2v2h-2v-2zm-4-3h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 0h2v2H7v-2z"/></svg>');
}

.json-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6zm2-4h8v2H8v-2zm0-3h8v2H8v-2z"/></svg>');
}

/* 按钮激活状态 */
.preview-button:active,
.generate-button:active {
  transform: translateY(1px);
  box-shadow: none;
}

/* 改进Excel按钮的图标颜色过渡效果 */
.preview-button:hover .excel-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%237c82ff"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM7 15h2v2H7v-2zm8 0h2v2h-2v-2zm-4-3h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 0h2v2H7v-2z"/></svg>');
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.dialog-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3), 
              0 4px 8px rgba(0, 0, 0, 0.4), 
              0 12px 24px rgba(0, 0, 0, 0.4);
  background: rgba(30, 30, 30, 0.95);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(40, 40, 40, 0.95);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1em;
  font-weight: 600;
}

.excel-dialog-icon,
.json-dialog-icon {
  width: 24px;
  height: 24px;
  display: inline-block;
}

.excel-dialog-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM7 15h2v2H7v-2zm8 0h2v2h-2v-2zm-4-3h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 0h2v2H7v-2z"/></svg>');
}

.json-dialog-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6zm2-4h8v2H8v-2zm0-3h8v2H8v-2z"/></svg>');
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dialog-body {
  padding: 24px;
  background: var(--bg-secondary);
}

.template-section {
  background: rgba(20, 20, 20, 0.95);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}

.tip-text {
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-size: 0.9em;
}

.json-template {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  overflow-x: auto;
  color: var(--text-secondary);
  font-family: monospace;
  font-size: 0.9em;
  border: 1px solid var(--border-color);
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(25, 25, 25, 0.95);
}

.upload-area:hover {
  border-color: var(--primary-color);
  background: rgba(100, 108, 255, 0.04);
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  display: inline-block;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>');
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: rgba(40, 40, 40, 0.95);
}

.cancel-btn,
.confirm-btn,
.download-btn {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s ease;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.confirm-btn {
  background: var(--primary-gradient);
  border: none;
  color: white;
}

.download-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}

.download-btn:hover,
.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(100, 108, 255, 0.2);
}

.download-icon {
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>');
}

.file-name {
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 0.9em;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 