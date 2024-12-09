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
              <h1 class="title">量子慧眼</h1>
              <div class="subtitle">QuanTech Vision</div>
            </div>
          </div>

          <nav class="nav-menu">
            <router-link to="/" custom v-slot="{ navigate, isActive }">
              <button 
                @click="navigate" 
                class="nav-button" 
                :class="{ active: isActive }">
                任务列表
              </button>
            </router-link>
            <router-link to="/report" custom v-slot="{ navigate, isActive }">
              <button 
                @click="navigate" 
                class="nav-button" 
                :class="{ active: isActive }">
                生成报告
              </button>
            </router-link>
            <button class="nav-button settings-button" @click="showSettings = true">
              <i class="settings-icon"></i>
              设置
            </button>
          </nav>
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
  -webkit-text-fill-color: transparent;
  font-size: 2em;
  font-weight: bold;
  font-family: "微软雅黑", sans-serif;
  text-shadow: 0 0 10px rgba(164, 85, 247, 0.3);
}

.subtitle {
  color: var(--text-light);
  font-size: 1.2em;
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

.nav-menu {
  display: flex;
  gap: 10px;
  z-index: 100;
  position: relative;
}

.nav-button {
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--text-light);
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--primary-gradient);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
  z-index: -1;
}

.nav-button:hover {
  color: white;
  border-color: var(--secondary-color);
  box-shadow: 0 0 15px rgba(100, 108, 255, 0.2);
}

.nav-button:hover::before {
  transform: scaleX(1);
  transform-origin: left;
}

.nav-button.active {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 0 15px rgba(100, 108, 255, 0.3);
}

.nav-menu::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #646cff 25%, 
    #a855f7 50%, 
    #646cff 75%, 
    transparent 100%
  );
  border-radius: 22px;
  z-index: -1;
  animation: nav-shine 3s linear infinite;
  opacity: 0.5;
}

@keyframes nav-shine {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.settings-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.settings-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23646cff"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.65.07-.97 0-.32-.03-.65-.07-.97l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65c-.04-.24-.25-.42-.5-.42h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.63c-.04.32-.07.65-.07.97 0 .32.03.65.07.97l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.63z"/></svg>');
  filter: drop-shadow(0 0 2px #646cff);
}

.settings-button:hover .settings-icon {
  transform: rotate(45deg);
}

.logo-svg circle,
.logo-svg path {
  stroke: url(#gradient);
  fill: url(#gradient);
}
</style> 