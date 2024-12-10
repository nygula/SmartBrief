import BaseAIService from './BaseAIService'

class WenxinService extends BaseAIService {
  constructor(apiKey) {
    super(apiKey, 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1')
  }

  async generateContent(prompt) {
    const data = {
      model: "ernie-bot",
      text: prompt
    }
    
    return await this.makeRequest('/ernie-bot', data)
  }
}

export default WenxinService 