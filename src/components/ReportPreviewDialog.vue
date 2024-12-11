<template>
  <transition name="dialog-fade">
    <div v-if="modelValue" class="preview-dialog">
      <div class="dialog-backdrop" @click="$emit('update:modelValue', false)"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h2>
            <i class="preview-icon"></i>
            报告预览
          </h2>
          <button class="close-button" @click="$emit('update:modelValue', false)">
            <span>×</span>
          </button>
        </div>
        
        <div class="dialog-body">
          <div class="report-content" v-html="formattedContent"></div>
        </div>

        <div class="dialog-footer">
          <button class="secondary-button" @click="$emit('update:modelValue', false)">
            关闭
          </button>
          <button class="primary-button" @click="handleCopy">
            <i class="copy-icon"></i>
            复制内容
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default {
  name: 'ReportPreviewDialog',
  props: {
    modelValue: Boolean,
    content: {
      type: String,
      default: ''
    }
  },
  
  computed: {
    formattedContent() {
      if (!this.content) return '';
      // 将 Markdown 转换为 HTML 并进行安全过滤
      const rawHtml = marked(this.content);
      return DOMPurify.sanitize(rawHtml);
    }
  },
  
  methods: {
    async handleCopy() {
      try {
        await navigator.clipboard.writeText(this.content);
        // TODO: 显示复制成功提示
        alert('内容已复制到剪贴板');
      } catch (error) {
        console.error('复制失败:', error);
        alert('复制失败');
      }
    }
  }
}
</script>

<style scoped>
.preview-dialog {
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
  width: 80%;
  max-width: 1000px;
  max-height: 85vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: dialog-slide-in 0.3s ease-out;
  border: 1px solid var(--border-color);
}

.dialog-header {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.5em;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-light);
}

.dialog-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #1a1a1a;
}

.report-content {
  color: var(--text-light);
  line-height: 1.6;
  font-size: 1.1em;
}

.report-content :deep(h1),
.report-content :deep(h2),
.report-content :deep(h3) {
  color: #646cff;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
}

.report-content :deep(p) {
  margin: 1em 0;
}

.report-content :deep(ul),
.report-content :deep(ol) {
  padding-left: 2em;
  margin: 1em 0;
}

.report-content :deep(code) {
  background: rgba(100, 108, 255, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: monospace;
}

.report-content :deep(pre) {
  background: #2a2a2a;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
}

.dialog-footer {
  padding: 15px 20px;
  background: #1a1a1a;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border-color);
}

.close-button {
  background: none;
  border: none;
  color: var(--text-light);
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
  background: linear-gradient(135deg, #646cff 0%, #a855f7 100%);
  color: white;
  border: none;
}

.secondary-button {
  background: transparent;
  color: var(--text-light);
  border: 2px solid #646cff;
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(100, 108, 255, 0.3);
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
.preview-icon,
.copy-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
}

.preview-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e0e0e0"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>');
}

.copy-icon {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>');
}

/* 滚动条样式 */
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
</style> 