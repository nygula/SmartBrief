// AI 服务工厂类
class AIServiceFactory {
  constructor() {
    this.service = null;
  }

  // 初始化服务
  initializeService(settings) {
    const { modelType, url, apiKey, modelName } = settings.api;
    
    switch(modelType) {
      case 'doubao':
        this.service = new DoubaoService(url, apiKey, modelName);
        break;
      case 'chatgpt':
        this.service = new ChatGPTService(url, apiKey, modelName);
        break;
      case 'qianwen':
        this.service = new QianwenService(url, apiKey, modelName);
        break;
      case 'wenxin':
        this.service = new WenxinService(url, apiKey, modelName);
        break;
      default:
        throw new Error('不支持的模型类型');
    }
  }

  async generateReport(prompt) {
    if (!this.service) {
      throw new Error('AI 服务未初始化');
    }
    return await this.service.generateCompletion(prompt);
  }
}

// 基础 AI 服务类
class BaseAIService {
  constructor(url, apiKey, modelName) {
    this.url = url;
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  async makeRequest(endpoint, data) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API 请求错误:', error);
      throw error;
    }
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }
}

// 豆包服务实现
class DoubaoService extends BaseAIService {
  async generateCompletion(prompt) {
    const data = {
      model: this.modelName,
      messages: [
        {
          role: "system",
          content: "你是豆包，是由字节跳动开发的 AI 人工智能助手."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    };

    const result = await this.makeRequest(this.url, data);
    return result.choices[0].message.content;
  }
}

// ChatGPT 服务实现
class ChatGPTService extends BaseAIService {
  async generateCompletion(prompt) {
    const data = {
      model: this.modelName,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };

    const result = await this.makeRequest(this.url, data);
    return result.choices[0].message.content;
  }
}

// 通义千问服务实现
class QianwenService extends BaseAIService {
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.apiKey
    };
  }

  async generateCompletion(prompt) {
    const data = {
      model: this.modelName,
      input: {
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      }
    };

    const result = await this.makeRequest(this.url, data);
    return result.output.text;
  }
}

// 文心一言服务实现
class WenxinService extends BaseAIService {
  async generateCompletion(prompt) {
    const data = {
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };

    const result = await this.makeRequest(`${this.url}/chat/${this.modelName}`, data);
    return result.result;
  }
}

export const aiManager = new AIServiceFactory(); 