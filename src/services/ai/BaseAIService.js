class BaseAIService {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  async makeRequest(endpoint, data) {
    try {
      const response = await fetch(this.baseUrl + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API 调用错误:', error)
      throw error
    }
  }
}

export default BaseAIService 