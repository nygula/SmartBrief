import { createRouter, createWebHashHistory } from 'vue-router'
import TaskList from '../views/TaskList.vue'
import ReportGenerate from '../views/ReportGenerate.vue'
import ProjectConfig from '../views/ProjectConfig.vue'

const routes = [
  {
    path: '/',
    name: 'TaskList',
    component: TaskList
  },
  {
    path: '/project-config',
    name: 'ProjectConfig',
    component: ProjectConfig
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