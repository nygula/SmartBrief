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
            <router-link to="/">任务列表</router-link> |
            <router-link to="/report">生成报告</router-link>
          </nav>
        </div>
      </div>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  errorCaptured(err, vm, info) {
    console.error('应用错误:', err)
    console.error('错误信息:', info)
    return false // 阻止错误继续传播
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
}

.logo-title-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo-svg {
  flex-shrink: 0;
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
  font-size: 1.1em;
}

.nav-menu a {
  color: #42b983;
  text-decoration: none;
  padding: 5px 15px;
  transition: all 0.3s ease;
}

.nav-menu a:hover {
  color: #2c3e50;
}

.nav-menu a.router-link-active {
  color: #2c3e50;
  font-weight: bold;
}
</style> 