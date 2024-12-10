// 基础服务类和具体实现保持不变...
class BaseAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateContent(prompt) {
    throw new Error('需要在子类中实现 generateContent 方法');
  }
}

// ChatGPT 服务实现
class ChatGPTService extends BaseAIService {
  constructor(apiKey, baseUrl = 'https://api.openai.com/v1') {
    super(apiKey);
    this.baseUrl = baseUrl;
  }

  async generateContent(prompt) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`ChatGPT API 错误: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('ChatGPT 服务错误:', error);
      throw new Error(`ChatGPT 服务调用失败: ${error.message}`);
    }
  }
}

// 通义千问服务实现
class QianwenService extends BaseAIService {
  constructor(apiKey, baseUrl = 'https://dashscope.aliyuncs.com/api/v1') {
    super(apiKey);
    this.baseUrl = baseUrl;
  }

  async generateContent(prompt) {
    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          input: {
            prompt: prompt
          }
        })
      });

      if (!response.ok) {
        throw new Error(`千问 API 错误: ${response.status}`);
      }

      const data = await response.json();
      return data.output.text;
    } catch (error) {
      console.error('千问服务错误:', error);
      throw new Error(`千问服务调用失败: ${error.message}`);
    }
  }
}

// 文心一言服务实现
class WenxinService extends BaseAIService {
  constructor(apiKey, baseUrl = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop') {
    super(apiKey);
    this.baseUrl = baseUrl;
  }

  async generateContent(prompt) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`文心一言 API 错误: ${response.status}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('文心一言服务错误:', error);
      throw new Error(`文心一言服务调用失败: ${error.message}`);
    }
  }
}

class DoubaoService extends BaseAIService {
  constructor(apiKey, baseUrl = 'https://api.doubao.com') {
    super(apiKey);
    this.baseUrl = baseUrl;
  }

  async generateContent(prompt) {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`豆包 API 错误: ${response.status}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('豆包服务错误:', error);
      throw new Error(`豆包服务调用失败: ${error.message}`);
    }
  }
}

class AIServiceFactory {
  static createService(type, config) {
    const { apiKey, baseUrl } = config;
    
    switch (type) {
      case 'chatgpt':
        return new ChatGPTService(apiKey, baseUrl);
      case 'doubao':
        return new DoubaoService(apiKey, baseUrl);
      case 'qianwen':
        return new QianwenService(apiKey, baseUrl);
      case 'wenxin':
        return new WenxinService(apiKey, baseUrl);
      default:
        throw new Error(`不支持的 AI 模型类型: ${type}`);
    }
  }
}

// 创建一个统一的 AI 服务管理器
export class AIManager {
  constructor() {
    this.currentService = null;
  }

  async initializeService() {
    try {
      // 实时读取系统配置
      const settings = await window.electronAPI.loadSettings();
      if (!settings?.api) {
        throw new Error('未找到 AI 服务配置');
      }

      const { modelType, apiKey, url } = settings.api;
      const type = modelType.toLowerCase();
      
      console.log('初始化 AI 服务:', {
        type,
        hasApiKey: !!apiKey,
        url
      });

      this.currentService = AIServiceFactory.createService(type, {
        apiKey,
        baseUrl: url || undefined
      });
    } catch (error) {
      console.error('初始化 AI 服务失败:', error);
      throw error;
    }
  }

  async generateReport(prompt) {
    try {
      // 每次生成报告时重新初始化服务
      await this.initializeService();
      
      if (!this.currentService) {
        throw new Error('AI 服务未初始化');
      }
      
      console.log('使用的 AI 服务类型:', this.currentService.constructor.name);
      
      return await this.currentService.generateContent(prompt);
    } catch (error) {
      console.error('生成报告失败:', error);
      throw error;
    }
  }
}

export const aiManager = new AIManager();
