const simpleGit = require('simple-git')
const moment = require('moment')

class GitService {
  async getGitLogs(projectPath, startDate, endDate) {
    try {
      const git = simpleGit(projectPath)
      const logs = await git.log({
        from: moment(startDate).format('YYYY-MM-DD'),
        to: moment(endDate).format('YYYY-MM-DD')
      })
      
      return logs.all.map(commit => ({
        hash: commit.hash,
        date: commit.date,
        message: commit.message,
        author: commit.author_name
      }))
    } catch (error) {
      console.error('获取Git日志失败:', error)
      throw error
    }
  }
}

let gitService = null

function initGitService() {
  if (!gitService) {
    gitService = new GitService()
  }
  return gitService
}

module.exports = { initGitService } 