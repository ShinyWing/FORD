import { openai } from '../config/openai';
import { AIService } from './aiService';

export class ApiTester {
  static async checkOpenAIConnection(): Promise<boolean> {
    try {
      console.log('🔍 正在检测OpenAI API连接...');
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a connection test. Please respond with "OK".'
          }
        ],
        max_tokens: 5,
        temperature: 0
      });

      if (response.choices[0]?.message?.content) {
        console.log('✅ OpenAI API连接成功！');
        console.log('📝 测试回应:', response.choices[0].message.content);
        return true;
      } else {
        console.log('❌ OpenAI API响应格式异常');
        return false;
      }
    } catch (error: any) {
      console.log('❌ OpenAI API连接失败:', error.message);
      console.log('🔄 将使用模拟数据降级模式');
      return false;
    }
  }

  static async init(): Promise<void> {
    console.log('🚀 初始化FORD辩论框架...');
    await this.checkOpenAIConnection();
    
    // 测试INCON计算功能
    console.log('\n📊 测试INCON计算系统...');
    AIService.testINCONCalculation();
    
    console.log('\n🎯 系统准备完成，开始体验真实AI辩论！');
  }
}

// 自动执行API检测
ApiTester.init(); 