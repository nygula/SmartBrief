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
      if (!window.electronAPI?.makeAIRequest) {
        throw new Error('makeAIRequest API 未定义');
      }

      const response = await window.electronAPI.makeAIRequest({
        url: endpoint,
        method: 'POST',
        headers: this.getHeaders(),
        body: data
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      return response.data;
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
    try {
      // 豆包 API 返回格式：{ choices: [{ message: { content: "..." } }] }
      if (result.choices?.[0]?.message?.content) {
        return result.choices[0].message.content;
      }
      throw new Error('豆包 API 返回格式异常');
    } catch (error) {
      console.error('解析豆包响应失败:', error);
      throw error;
    }
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
      ],
      temperature: 0.7
    };

    try {
      const result = await this.makeRequest(this.url, data);
      // OpenAI API 返回格式：
      // {
      //   "id": "chatcmpl-12345",
      //   "object": "chat.completion",
      //   "created": 1677652288,
      //   "choices": [{
      //     "index": 0,
      //     "message": { "role": "assistant", "content": "..." },
      //     "finish_reason": "stop"
      //   }],
      //   "usage": { "prompt_tokens": 9, "completion_tokens": 14, "total_tokens": 23 }
      // }
      if (result.choices?.[0]?.message?.content) {
        return result.choices[0].message.content;
      }
      throw new Error('OpenAI API 返回格式异常');
    } catch (error) {
      console.error('解析 OpenAI 响应失败:', error);
      throw error;
    }
  }
}

// 通义千问服务实现
class QianwenService extends BaseAIService {
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async generateCompletion(prompt) {
    const data = {
      model: this.modelName,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    };

    try {
      const result = await this.makeRequest(this.url, data);
      // 通义千问 API 返回格式：
      // {
      //   "id": "chatcmpl-67890",
      //   "object": "chat.completion",
      //   "created": 1677652288,
      //   "choices": [{
      //     "index": 0,
      //     "message": { "role": "assistant", "content": "..." },
      //     "finish_reason": "stop"
      //   }],
      //   "usage": { "prompt_tokens": 9, "completion_tokens": 14, "total_tokens": 23 }
      // }
      if (result.choices?.[0]?.message?.content) {
        return result.choices[0].message.content;
      }
      throw new Error('通义千问 API 返回格式异常');
    } catch (error) {
      console.error('解析通义千问响应失败:', error);
      throw error;
    }
  }
}

// 文心一言服务实现
class WenxinService extends BaseAIService {
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': this.apiKey
    };
  }

  async generateCompletion(prompt) {
    const data = {
      text: prompt,
      top_p: 0.8,
      temperature: 0.7
    };

    try {
      const result = await this.makeRequest(this.url, data);
      // 文心一言 API 返回格式：
      // {
      //   "result": "您好！今天的天气晴朗，温度适中，适合进行户外活动。",
      //   "log_id": "1234567890",
      //   "usage": { "prompt_tokens": 9, "completion_tokens": 14, "total_tokens": 23 }
      // }
      if (result?.result) {
        return result.result;
      }
      throw new Error('文心一言 API 返回格式异常');
    } catch (error) {
      console.error('解析文心一言响应失败:', error);
      throw error;
    }
  }
}

export const aiManager = new AIServiceFactory(); 