import OpenAI from 'openai';

// 请按照以下步骤配置你的API密钥：
// 1. 复制根目录下的 config.example.js 为 config.js
// 2. 在 config.js 中填入你的 OpenAI API 密钥
// 3. 重新启动应用程序

// ⚠️ 安全提示：请不要将真实的API密钥直接写在代码中！
// 为了演示目的，这里提供了一个示例密钥格式，请替换为你自己的密钥
export const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || 'your_openai_api_key_here';

// 如果没有配置API密钥，显示警告
if (OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.warn('⚠️ 警告：请配置你的OpenAI API密钥！');
  console.warn('1. 复制 config.example.js 为 config.js');
  console.warn('2. 在 config.js 中填入你的API密钥');
  console.warn('3. 或者设置环境变量 REACT_APP_OPENAI_API_KEY');
}

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 注意：在生产环境中应该使用后端代理
});

// 模型配置
export const MODEL_CONFIG = {
  'gpt-4': {
    modelName: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7,
    displayName: 'GPT-4',
    capability: 'high' as const
  },
  'gpt-3.5-turbo': {
    modelName: 'gpt-3.5-turbo',
    maxTokens: 800,
    temperature: 0.7,
    displayName: 'GPT-3.5 Turbo',
    capability: 'medium' as const
  },
  'gpt-4-turbo': {
    modelName: 'gpt-4-turbo',
    maxTokens: 1200,
    temperature: 0.7,
    displayName: 'GPT-4 Turbo',
    capability: 'high' as const
  }
};

export type ModelType = keyof typeof MODEL_CONFIG; 