<template>
  <transition name="dialog-fade">
    <div v-if="modelValue" class="success-dialog">
      <div class="dialog-backdrop" @click="$emit('update:modelValue', false)"></div>
      <div class="dialog-content">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path 
              fill="#4CAF50" 
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
        </div>
        <h2>生成成功！</h2>
        <p class="file-path">文件已保存至：</p>
        <div class="path-container">
          {{ filePath }}
        </div>
        <div class="dialog-footer">
          <button class="primary-button" @click="openFile">
            <i class="folder-icon"></i>
            打开文件位置
          </button>
          <button class="secondary-button" @click="$emit('update:modelValue', false)">
            关闭
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'SuccessDialog',
  props: {
    modelValue: Boolean,
    filePath: {
      type: String,
      default: ''
    }
  },
  methods: {
    openFile() {
      window.electronAPI.showItemInFolder(this.filePath);
    }
  }
}
</script>

<style scoped>
.success-dialog {
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
  background: var(--bg-dark);
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid var(--border-color);
  max-width: 90%;
  width: 500px;
  z-index: 1;
}

.success-icon {
  margin-bottom: 20px;
}

.success-icon svg {
  fill: var(--primary-color);
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  background-clip: text;
}

h2 {
  margin: 0 0 20px;
  font-size: 1.5em;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.file-path {
  margin-bottom: 10px;
  color: var(--text-secondary);
}

.path-container {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
  word-break: break-all;
  margin-bottom: 25px;
  border: 1px solid var(--border-color);
  color: var(--text-light);
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.primary-button,
.secondary-button {
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
  background: var(--primary-gradient);
  color: white;
  border: none;
}

.secondary-button {
  background: transparent;
  color: var(--text-light);
  border: 2px solid var(--border-color);
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(100, 108, 255, 0.3);
}

.folder-icon {
  width: 18px;
  height: 18px;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>');
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

@keyframes scale-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style> 