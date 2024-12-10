import BaseAIService from './BaseAIService'

class DoubaoService extends BaseAIService {
  constructor(apiKey) {
    super(apiKey, 'https://maas-api.ml-platform-cn-beijing.volces.com')
  }

  async generateContent(prompt) {
    const data = {
      model: "Doubao-pro-4k",
      input: prompt
    }
    
    return await this.makeRequest('/v1/endpoint', data)
  }
}

export default DoubaoService 