import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import './assets/styles/global.css'
import './assets/styles/main.css'

const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app') 