<template>
  <div class="app-wrapper">
    <div class="app-container">
      <div class="header-container">
        <div class="header-content">
          <div class="logo-title-wrapper">
            <svg class="logo-svg" width="80" height="80" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="55" fill="none" stroke="#42b983" stroke-width="2">
                <animate attributeName="stroke-dasharray" from="0,360" to="360,360" dur="3s" />
                <animate attributeName="stroke-dashoffset" from="360" to="0" dur="3s" />
              </circle>
              
              <g class="quantum-particles">
                <circle cx="60" cy="25" r="3" fill="#42b983">
                  <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="95" cy="60" r="3" fill="#42b983">
                  <animate attributeName="opacity" values="0;1;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="60" cy="95" r="3" fill="#42b983">
                  <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1s" repeatCount="indefinite" />
                </circle>
                <circle cx="25" cy="60" r="3" fill="#42b983">
                  <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.5s" repeatCount="indefinite" />
                </circle>
              </g>
              
              <path d="M60 35 L85 60 L60 85 L35 60 Z" fill="#42b983" opacity="0.8">
                <animate attributeName="transform" attributeType="XML" 
                         type="rotate" from="0 60 60" to="360 60 60" 
                         dur="10s" repeatCount="indefinite"/>
              </path>
              
              <circle cx="60" cy="60" r="30" fill="none" stroke="#42b983" stroke-width="1">
                <animate attributeName="r" values="20;40;20" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite"/>
              </circle>
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
.header-container {
  padding: 20px 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
}

.logo-title-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo-svg {
  flex-shrink: 0;
  z-index: 1;
}

.title-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title {
  margin: 0;
  line-height: 1.2;
  background: linear-gradient(120deg, #42b983, #2c3e50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.5em;
  font-weight: bold;
  font-family: "微软雅黑", sans-serif;
}

.subtitle {
  color: #666;
  font-size: 1.2em;
  letter-spacing: 2px;
}

.quantum-particles circle {
  filter: drop-shadow(0 0 5px #42b983);
}

.logo-svg {
  animation: float 4s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(66, 185, 131, 0.3));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(2deg);
  }
}

.app-wrapper {
  min-height: 100vh;
  padding: 20px;
  overflow-x: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.nav-menu {
  display: flex;
  gap: 10px;
  z-index: 100;
}

.nav-button {
  background: rgba(66, 185, 131, 0.1);
  border: 2px solid #42b983;
  color: #42b983;
  padding: 8px 20px;
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
  background: #42b983;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
  z-index: -1;
}

.nav-button:hover {
  color: white;
}

.nav-button:hover::before {
  transform: scaleX(1);
  transform-origin: left;
}

.nav-button.active {
  background: #42b983;
  color: white;
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
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2342b983"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.65.07-.97 0-.32-.03-.65-.07-.97l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65c-.04-.24-.25-.42-.5-.42h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.63c-.04.32-.07.65-.07.97 0 .32.03.65.07.97l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.63z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  transition: transform 0.3s ease;
}

.settings-button:hover .settings-icon {
  transform: rotate(45deg);
}
</style> 