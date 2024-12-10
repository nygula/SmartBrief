import ChatGPTService from './ChatGPTService'
import DoubaoService from './DoubaoService'
import QianwenService from './QianwenService'
import WenxinService from './WenxinService'

class AIServiceFactory {
  static createService(type, config) {
    switch (type) {
      case 'chatgpt':
        return new ChatGPTService(config.apiKey)
      case 'doubao':
        return new DoubaoService(config.apiKey)
      case 'qianwen':
        return new QianwenService(config.apiKey)
      case 'wenxin':
        return new WenxinService(config.apiKey)
      default:
        throw new Error(`不支持的 AI 模型类型: ${type}`)
    }
  }
}

// 创建一个统一的 AI 服务管理器
export class AIManager {
  constructor() {
    this.currentService = null
  }

  initializeService(settings) {
    const { modelType, apiKey, url } = settings.api
    this.currentService = AIServiceFactory.createService(modelType, {
      apiKey,
      baseUrl: url || undefined
    })
  }

  async generateReport(prompt) {
    if (!this.currentService) {
      throw new Error('AI 服务未初始化')
    }
    return await this.currentService.generateContent(prompt)
  }
}
export const aiManager = new AIManager()
