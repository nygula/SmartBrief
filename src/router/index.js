import { createRouter, createWebHashHistory } from 'vue-router'
import TaskList from '../views/TaskList.vue'
import ReportGenerate from '../views/ReportGenerate.vue'

const routes = [
  {
    path: '/',
    name: 'TaskList',
    component: TaskList
  },
  {
    path: '/report',
    name: 'ReportGenerate',
    component: ReportGenerate
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router 