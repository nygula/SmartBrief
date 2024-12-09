<template>
  <div class="app-wrapper">
    <div class="app-container">
      <div class="logo">
        <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#42b983">
            <animate attributeName="r" values="45;50;45" dur="2s" repeatCount="indefinite"/>
          </circle>
          <text x="60" y="70" text-anchor="middle" fill="white" font-size="40">AI</text>
        </svg>
        <h1>AI报告生成工具</h1>
      </div>
      <nav class="nav-menu">
        <router-link to="/">任务列表</router-link> |
        <router-link to="/report">生成报告</router-link>
      </nav>
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
  name: 'App'
}
</script>

<style>
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.logo svg {
  animation: float 3s ease-in-out infinite;
}

h1 {
  color: #42b983;
  font-size: 2em;
  margin: 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  display: inline-block;
}

h1::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: -5px;
  left: 0;
  background-color: #42b983;
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.3s ease-out;
}

h1:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
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

h1 {
  color: #42b983;
  font-size: 2em;
  margin: 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
</style> 