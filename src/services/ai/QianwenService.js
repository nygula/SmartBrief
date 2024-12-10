import BaseAIService from './BaseAIService'

class QianwenService extends BaseAIService {
  constructor(apiKey) {
    super(apiKey, 'https://dashscope.cn/api/v1')
  }

  async generateContent(prompt) {
    const data = {
      model: "qwen_turbo",
      prompt: prompt
    }
    
    return await this.makeRequest('/generation', data)
  }
}

export default QianwenService 