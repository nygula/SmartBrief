import { createStore } from 'vuex'

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
    },
    SET_GIT_LOGS(state, logs) {
      state.gitLogs = logs
    },
    SET_PROJECT_PATH(state, path) {
      state.projectPath = path
    }
  },
  actions: {
    async loadTasks({ commit }) {
      const tasks = await window.electronAPI.loadTasks()
      commit('SET_TASKS', tasks || [])
    },
    async saveTask({ commit }, task) {
      await window.electronAPI.saveTask(task)
      commit('ADD_TASK', task)
      return task
    },
    async saveTasks({ commit }, tasks) {
      await window.electronAPI.saveTasks(tasks)
      commit('SET_TASKS', tasks)
      return tasks
    },
    async fetchGitLogs({ commit }, { startDate, endDate }) {
      const logs = await window.electronAPI.getGitLogs({
        projectPath: this.state.projectPath,
        startDate,
        endDate
      })
      commit('SET_GIT_LOGS', logs)
    }
  }
}) 