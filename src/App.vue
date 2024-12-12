<template>
  <div class="app-wrapper">
    <svg style="width:0;height:0;position:absolute;" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#646cff" />
          <stop offset="100%" style="stop-color:#a855f7" />
        </linearGradient>
        <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#a855f7" />
          <stop offset="100%" style="stop-color:#646cff" />
        </radialGradient>
      </defs>
    </svg>
    <div class="app-container">
      <div class="header-container">
        <div class="header-content">
          <div class="logo-title-wrapper">
            <svg class="logo-svg" width="60" height="60" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
              <rect 
                x="60" 
                y="60" 
                width="40" 
                height="40" 
                fill="url(#glowGradient)"
                class="glow-shape"
                transform="translate(-20, -20) rotate(45, 60, 60)"
              >
                <animate 
                  attributeName="opacity" 
                  values="0.8;1;0.8" 
                  dur="3s" 
                  repeatCount="indefinite"
                />
              </rect>
              
              <circle cx="60" cy="20" r="4" fill="url(#gradient)" />
              <circle cx="100" cy="60" r="4" fill="url(#gradient)" />
              <circle cx="60" cy="100" r="4" fill="url(#gradient)" />
              <circle cx="20" cy="60" r="4" fill="url(#gradient)" />
            </svg>
            
            <div class="title-container">
              <h1 class="title">SmartBrief</h1>
              <div class="subtitle">智能简报·Fuck Report</div>
            </div>
          </div>

          <div class="nav-steps">
            <div class="steps-container">
              <div 
                class="step-item" 
                :class="{ 
                  active: currentRoute === '/',
                  completed: currentRoute === '/project-config' || currentRoute === '/report'
                }"
                @click="$router.push('/')"
              >
                <div class="step-number">1</div>
                <div class="step-label">任务清单</div>
                <div class="step-line"></div>
              </div>
              <div 
                class="step-item"
                :class="{ 
                  active: currentRoute === '/project-config',
                  completed: currentRoute === '/report'
                }"
                @click="$router.push('/project-config')"
              >
                <div class="step-number">2</div>
                <div class="step-label">项目配置</div>
                <div class="step-line"></div>
              </div>
              <div 
                class="step-item"
                :class="{ active: currentRoute === '/report' }"
                @click="$router.push('/report')"
              >
                <div class="step-number">3</div>
                <div class="step-label">生成报告</div>
              </div>
            </div>
            <button class="settings-button" @click="showSettings = true" title="系统设置">
              <span class="button-content">
                <svg class="settings-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.65.07-.97 0-.32-.03-.65-.07-.97l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65c-.04-.24-.25-.42-.5-.42h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.63c-.04.32-.07.65-.07.97 0 .32.03.65.07.97l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.63z"/>
                </svg>
                <span class="button-text">设置</span>
              </span>
            </button>
          </div>
        </div>
      </div>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    
    <SettingsDialog 
      v-model="showSettings"
      @settings-saved="handleSettingsSaved"
    />
  </div>
</template>

<script>
import SettingsDialog from './components/SettingsDialog.vue'

export default {
  name: 'App',
  components: {
    SettingsDialog
  },
  data() {
    return {
      showSettings: false
    }
  },
  methods: {
    handleSettingsSaved(settings) {
      console.log('设置已保存:', settings)
      // 这里可以处理设置保存后的逻辑
    }
  },
  errorCaptured(err, vm, info) {
    console.error('应用错误:', err)
    console.error('错误信息:', info)
    return false
  },
  computed: {
    currentRoute() {
      return this.$route.path
    }
  }
}
</script>

<style>
:root {
  --primary-gradient: linear-gradient(135deg, #646cff 0%, #a855f7 100%);
  --primary-color: #646cff;
  --secondary-color: #a855f7;
  --bg-dark: #222;
  --text-light: #e0e0e0;
}

.header-container {
  padding: 12px 0;
  background: var(--bg-dark);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
  z-index: 2;
}

.logo-title-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo-svg {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  z-index: 1;
  animation: float 4s ease-in-out infinite;
}

.title-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title {
  margin: 0;
  line-height: 1.2;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2em;
  font-weight: bold;
  font-family: "微软雅黑", sans-serif;
  text-shadow: 0 0 10px rgba(164, 85, 247, 0.3);
}

.subtitle {
  color: var(--text-light);
  font-size: 0.8em;
  letter-spacing: 2px;
}

.glow-shape {
  filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.6));
}

.app-wrapper {
  min-height: 100vh;
  padding: 12px;
  overflow-x: hidden;
  background: var(--bg-dark);
  color: var(--text-light);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.nav-steps {
  display: flex;
  align-items: center;
  gap: 20px;
}

.steps-container {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 30px;
  position: relative;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 6px 20px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  border-radius: 20px;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 0.9em;
  color: var(--text-light);
  transition: all 0.3s ease;
}

.step-label {
  color: var(--text-light);
  font-weight: 500;
  transition: all 0.3s ease;
}

.step-line {
  position: absolute;
  right: -20px;
  width: 40px;
  height: 2px;
  background: var(--primary-color);
  opacity: 0.3;
  z-index: 1;
}

.step-item.active {
  background: var(--primary-gradient);
}

.step-item.active .step-number {
  background: white;
  border-color: white;
  color: var(--primary-color);
}

.step-item.active .step-label {
  color: white;
}

.step-item.completed .step-number {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.step-item.completed .step-line {
  background: var(--primary-gradient);
  opacity: 1;
}

.step-item:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
}

.settings-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 20px;
  color: var(--text-light);
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.settings-button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(45deg, #646cff, #a855f7);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 1;
}

.settings-icon {
  color: #646cff;
  transition: all 0.3s ease;
}

.button-text {
  background: linear-gradient(90deg, #646cff, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.settings-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.settings-button:hover .settings-icon {
  transform: rotate(180deg);
  color: #a855f7;
}

.logo-svg circle,
.logo-svg path {
  stroke: url(#gradient);
  fill: url(#gradient);
}
</style> 