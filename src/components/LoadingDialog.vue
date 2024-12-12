<template>
  <transition name="dialog-fade">
    <div v-if="modelValue" class="loading-dialog">
      <div class="dialog-backdrop"></div>
      <div class="dialog-content">
        <div class="loading-icon"></div>
        <h2>{{ title }}</h2>
        <p class="loading-text">{{ message }}</p>
        <div class="progress-bar" v-if="showProgress">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'LoadingDialog',
  props: {
    modelValue: Boolean,
    title: {
      type: String,
      default: '请稍候'
    },
    message: {
      type: String,
      default: '正在处理中...'
    },
    progress: {
      type: Number,
      default: 0
    },
    showProgress: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.loading-dialog {
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
  width: 400px;
  z-index: 1;
}

.loading-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 20px;
  border: 3px solid transparent;
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

h2 {
  margin: 0 0 10px;
  font-size: 1.2em;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.loading-text {
  color: var(--text-secondary);
  margin: 0 0 20px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-gradient);
  transition: width 0.3s ease;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
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