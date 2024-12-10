import BaseAIService from './BaseAIService'

class ChatGPTService extends BaseAIService {
  constructor(apiKey) {
    super(apiKey, 'https://api.openai.com/v1')
  }

  async generateContent(prompt) {
    const data = {
      model: "gpt-4",
      messages: [
        {role: "system", content: "你是一个专业的工作报告助手。"},
        {role: "user", content: prompt}
      ]
    }
    
    return await this.makeRequest('/chat/completions', data)
  }
}

export default ChatGPTService 