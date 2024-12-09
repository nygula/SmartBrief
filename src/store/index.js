import { createStore } from 'vuex'
import storageService from '../services/storageService'

export default createStore({
  state: {
    tasks: [],
    gitLogs: [],
    projectPath: ''
  },
  mutations: {
    SET_TASKS(state, tasks) {
      state.tasks = Array.isArray(tasks) ? tasks : []
    },
    ADD_TASK(state, task) {
      state.tasks.push(task)
    }
  },
  actions: {
    async loadTasks({ commit }) {
      try {
        const tasks = await storageService.loadTasks()
        commit('SET_TASKS', tasks || [])
      } catch (error) {
        console.error('加载任务失败:', error)
        commit('SET_TASKS', [])
      }
    },
    
    async saveTask({ commit, state }, task) {
      try {
        const updatedTasks = [...state.tasks, task]
        await storageService.saveTasks(updatedTasks)
        commit('SET_TASKS', updatedTasks)
      } catch (error) {
        console.error('保存任务失败:', error)
        throw error
      }
    },

    async saveTasks({ commit }, tasks) {
      try {
        await storageService.saveTasks(tasks)
        commit('SET_TASKS', tasks)
      } catch (error) {
        console.error('保存任务失败:', error)
        throw error
      }
    }
  }
}) 