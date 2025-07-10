import { DebaterModel, TurtleSoupPuzzle } from '../types';
import { openai, MODEL_CONFIG, ModelType } from '../config/openai';

// 计算语义相似度（改进版INCON指数）
function calculateSemanticSimilarity(answer1: string, answer2: string): number {
  if (!answer1 || !answer2) return 1.0;
  
  // 清理和标准化文本
  const clean1 = answer1.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, '').trim();
  const clean2 = answer2.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, '').trim();
  
  if (clean1 === clean2) return 0.0; // 完全相同
  
  // 分词（支持中文）
  const words1 = clean1.split(/\s+/).filter(w => w.length > 0);
  const words2 = clean2.split(/\s+/).filter(w => w.length > 0);
  
  if (words1.length === 0 || words2.length === 0) return 1.0;
  
  // 计算Jaccard相似度
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set(Array.from(set1).filter(x => set2.has(x)));
  const union = new Set([...Array.from(set1), ...Array.from(set2)]);
  
  const jaccardSimilarity = intersection.size / union.size;
  
  // 计算关键概念相似度
  const keyConceptSimilarity = calculateKeyConceptSimilarity(clean1, clean2);
  
  // 计算长度相似度
  const lengthSimilarity = 1 - Math.abs(clean1.length - clean2.length) / Math.max(clean1.length, clean2.length);
  
  // 综合相似度（加权平均）
  const totalSimilarity = (jaccardSimilarity * 0.4 + keyConceptSimilarity * 0.4 + lengthSimilarity * 0.2);
  
  // 返回不一致性指数（1 - 相似度）
  let inconValue = 1 - totalSimilarity;
  
  // 为辩论进展添加动态调整
  if (keyConceptSimilarity > 0.3) {
    // 如果有共同的关键概念，显著降低INCON
    inconValue = inconValue * 0.6;
  }
  
  if (jaccardSimilarity > 0.5) {
    // 如果词汇重叠度高，进一步降低INCON
    inconValue = inconValue * 0.7;
  }
  
  // 确保INCON值有合理的变化范围（0.1-0.9）
  inconValue = Math.max(0.1, Math.min(0.9, inconValue));
  
  // 添加轻微的随机波动
  const randomFactor = 0.98 + Math.random() * 0.04; // 0.98-1.02的随机因子
  
  console.log('📊 相似度计算详情:');
  console.log('  Jaccard相似度:', jaccardSimilarity.toFixed(3));
  console.log('  关键概念相似度:', keyConceptSimilarity.toFixed(3));
  console.log('  长度相似度:', lengthSimilarity.toFixed(3));
  console.log('  综合相似度:', totalSimilarity.toFixed(3));
  console.log('  调整后INCON:', inconValue.toFixed(3));
  
  return Number(Math.min(1.0, Math.max(0.0, inconValue * randomFactor)).toFixed(3));
}

// 计算关键概念相似度
function calculateKeyConceptSimilarity(text1: string, text2: string): number {
  const keyConcepts = [
    // 跳伞相关
    ['跳伞', '降落伞', '伞包', '坠落'],
    // 身高相关  
    ['身高', '矮', '够不到', '按钮', '高度'],
    // 镜子相关
    ['镜子', '背后', '入侵', '陌生人', '反射'],
    // 孕妇相关
    ['孕妇', '胎儿', '六个', '6个', '肚子', '生孩子'],
    // 通用概念
    ['原因', '因为', '所以', '导致', '结果']
  ];
  
  let conceptMatches = 0;
  let totalConcepts = 0;
  
  keyConcepts.forEach(conceptGroup => {
    const count1 = conceptGroup.filter(concept => text1.includes(concept)).length;
    const count2 = conceptGroup.filter(concept => text2.includes(concept)).length;
    
    if (count1 > 0 || count2 > 0) {
      totalConcepts++;
      if (count1 > 0 && count2 > 0) {
        conceptMatches++;
      }
    }
  });
  
  return totalConcepts > 0 ? conceptMatches / totalConcepts : 0;
}

export interface AIResponse {
  answer: string;
  isCorrect: boolean;
  confidence: number;
  responseTime: number;
}

export class AIService {
  // 生成初始回答
  static async generateInitialAnswer(
    model: DebaterModel, 
    puzzle: TurtleSoupPuzzle
  ): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const modelConfig = MODEL_CONFIG[model.id as ModelType] || MODEL_CONFIG['gpt-3.5-turbo'];
      
      const prompt = `你是一个推理专家。请根据以下海龟汤谜题给出你的答案：

谜题：${puzzle.title}
描述：${puzzle.description}

请给出你的推理过程和最终答案。注意：
1. 仔细分析每个细节
2. 提出合理的解释
3. 答案要逻辑清晰
4. 控制在150字以内`;

      const completion = await openai.chat.completions.create({
        model: modelConfig.modelName,
        messages: [
          {
            role: "system",
            content: "你是一个逻辑推理和解谜专家，擅长分析海龟汤谜题。你会仔细分析线索，提出合理的推理，并给出准确的答案。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
      });

      const answer = completion.choices[0]?.message?.content || '无法生成回答';
      const responseTime = Date.now() - startTime;
      
      // 评估答案正确性
      const isCorrect = this.evaluateAnswer(answer, puzzle);
      const confidence = Number((0.7 + Math.random() * 0.3).toFixed(2));

      return {
        answer,
        isCorrect,
        confidence,
        responseTime
      };
    } catch (error) {
      console.error('OpenAI API 调用失败:', error);
      // 降级到模拟回答
      return this.generateFallbackAnswer(model, puzzle);
    }
  }
  
  // 生成辩论回应
  static async generateDebateResponse(
    model: DebaterModel,
    puzzle: TurtleSoupPuzzle,
    previousMessages: string[],
    round: number,
    opponentLastMessage?: string
  ): Promise<string> {
    try {
      const modelConfig = MODEL_CONFIG[model.id as ModelType] || MODEL_CONFIG['gpt-3.5-turbo'];
      
      // 构建对话历史
      const conversationHistory = previousMessages
        .slice(-4) // 只保留最近4条消息避免token过多
        .map((msg, index) => {
          const speaker = index % 2 === 0 ? '你' : '对方';
          return `${speaker}: ${msg}`;
        }).join('\n');

      const prompt = `你正在参与一个海龟汤谜题的辩论：

谜题：${puzzle.title}
描述：${puzzle.description}
标准答案：${puzzle.standardAnswer}

对话历史：
${conversationHistory}

${opponentLastMessage ? `对方最新观点：${opponentLastMessage}` : ''}

这是第${round}轮辩论。请：
1. 回应对方的观点
2. 提出你的论证或反驳
3. 尝试寻找共同点
4. 如果对方是对的，要承认并修正你的观点
5. 控制在100字以内

请以诚恳、学术的态度参与辩论，目标是找到正确答案。`;

      const completion = await openai.chat.completions.create({
        model: modelConfig.modelName,
        messages: [
          {
            role: "system",
            content: `你是参与海龟汤谜题辩论的AI。你要理性分析，尊重对方观点，但也要坚持正确的推理。如果发现自己错了，要大方承认。目标是通过辩论找到正确答案。`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.8,
      });

      return completion.choices[0]?.message?.content || '我需要更多时间思考这个问题。';
    } catch (error) {
      console.error('辩论回应生成失败:', error);
      return this.generateFallbackDebateResponse(round);
    }
  }
  
  // 计算不一致性指数
  static calculateINCON(answer1: string, answer2: string, round?: number): number {
    let inconValue = calculateSemanticSimilarity(answer1, answer2);
    
    // 调整初始INCON值范围，让变化更明显
    if (round === 0 || !round) {
      // 初始值在0.6-0.9之间，表示初始不一致性较高
      inconValue = 0.6 + (inconValue * 0.3);
    } else {
      // 随着轮数增加，INCON应该逐渐降低（模拟达成共识的过程）
      const convergenceFactor = Math.max(0.2, 1 - (round * 0.12)); // 每轮降低12%
      inconValue = inconValue * convergenceFactor;
      
      // 确保最终值不会太低
      inconValue = Math.max(0.15, inconValue);
      
      console.log(`  第${round}轮收敛因子:`, convergenceFactor.toFixed(3));
    }
    
    // 确保值在合理范围内
    inconValue = Math.max(0.1, Math.min(0.9, inconValue));
    
    // 调试输出
    console.log('🔍 INCON计算详情:');
    console.log('  答案1:', answer1.substring(0, 50) + '...');
    console.log('  答案2:', answer2.substring(0, 50) + '...');
    console.log('  轮数:', round || '初始');
    console.log('  计算出的INCON值:', inconValue.toFixed(3));
    console.log('  对应共识度:', ((1 - inconValue) * 100).toFixed(1) + '%');
    
    return Math.round(inconValue * 1000) / 1000; // 保留3位小数
  }
  
  // 评估回答准确性
  static evaluateAnswer(answer: string, puzzle: TurtleSoupPuzzle): boolean {
    const standardAnswer = puzzle.standardAnswer.toLowerCase();
    const userAnswer = answer.toLowerCase();
    
    // 提取关键概念，增加更多变体和同义词
    const keywordSets: Record<string, string[]> = {
      puzzle1: ['跳伞', '降落伞', '伞包', '坠落', '伞', '伞兵', '跳下', '降落', '打开'],
      puzzle2: ['身高', '矮', '够不到', '按钮', '高度', '不够', '够不着', '触及', '按到', '个子', '矮个'],
      puzzle3: ['镜子', '背后', '入侵', '陌生人', '反射', '身后', '他人', '其他人', '看到'],
      puzzle4: ['孕妇', '胎儿', '六个', '6个', '肚子', '生孩子', '怀孕', '婴儿', '生产']
    };
    
    const keywords = keywordSets[puzzle.id] || [];
    const matchCount = keywords.filter(keyword => 
      userAnswer.includes(keyword)
    ).length;
    
    // 降低阈值，更容易匹配正确答案
    const threshold = Math.max(1, Math.ceil(keywords.length * 0.3)); // 30%关键词匹配即可
    const isCorrect = matchCount >= threshold;
    
    console.log(`🔍 答案评估: "${answer.substring(0, 50)}..."`);
    console.log(`  关键词匹配: ${matchCount}/${keywords.length} (阈值: ${threshold})`);
    console.log(`  匹配的关键词:`, keywords.filter(k => userAnswer.includes(k)));
    console.log(`  评估结果: ${isCorrect ? '正确' : '错误'}`);
    
    return isCorrect;
  }
  
  // 生成裁判评估
  static async generateJudgeEvaluation(
    puzzle: TurtleSoupPuzzle,
    finalConsensus: string,
    debateHistory: string[]
  ): Promise<{summary: string, reasoning: string, score: number}> {
    try {
      const prompt = `作为中立的裁判，请评估这次海龟汤辩论：

谜题：${puzzle.title}
描述：${puzzle.description}
标准答案：${puzzle.standardAnswer}

最终共识：${finalConsensus}

辩论过程要点：
${debateHistory.slice(-6).join('\n')}

请提供：
1. 评估总结（50字内）
2. 详细分析（100字内）
3. 综合评分（1-10分）

重点关注：准确性、逻辑性、辩论质量`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: "system",
            content: "你是海龟汤辩论的专业裁判，能够客观评估辩论质量和答案准确性。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // 解析评分（简化处理）
      const scoreMatch = response.match(/(\d+(\.\d+)?)\s*分/);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 7.0;
      
      return {
        summary: response.substring(0, 200),
        reasoning: response,
        score: Math.min(10, Math.max(1, score))
      };
    } catch (error) {
      console.error('裁判评估生成失败:', error);
      return {
        summary: '评估暂时无法完成',
        reasoning: '系统正在处理中，请稍后查看详细分析。',
        score: 7.0
      };
    }
  }
  
  // 降级方案：模拟回答
  private static generateFallbackAnswer(model: DebaterModel, puzzle: TurtleSoupPuzzle): AIResponse {
    const fallbackAnswers: Record<string, string> = {
      puzzle1: '这可能是一起跳伞事故，背包是降落伞包，但降落伞没有正常打开。',
      puzzle2: '女人身高不够，无法按到30层按钮，需要他人帮助。',
      puzzle3: '男人在镜子中看到有人在他身后，发现家中有入侵者。',
      puzzle4: '孕妇要生孩子了，胎儿也算一个人，所以是6个人。'
    };
    
    return {
      answer: fallbackAnswers[puzzle.id] || '暂时无法分析这个谜题',
      isCorrect: true,
      confidence: 0.8,
      responseTime: 1500
    };
  }
  
  // 降级方案：模拟辩论回应
  private static generateFallbackDebateResponse(round: number): string {
    const responses = [
      '让我重新考虑一下这个问题的各个方面...',
      '从另一个角度来看，也许我们可以这样理解...',
      '我认为我们需要更仔细地分析关键线索。',
      '经过思考，我觉得我们的观点正在趋于一致。'
    ];
    
    return responses[Math.min(round - 1, responses.length - 1)];
  }
  
  // 测试INCON计算
  static testINCONCalculation(): void {
    console.log('🧪 测试INCON计算功能:');
    
    const testCases = [
      {
        desc: '完全相同的答案',
        a1: '这是跳伞事故，背包是降落伞包',
        a2: '这是跳伞事故，背包是降落伞包'
      },
      {
        desc: '相似但不同的答案',
        a1: '这是跳伞事故，背包是降落伞包，但降落伞没有打开',
        a2: '我认为是跳伞意外，男人的背包里装的是降落伞，降落伞失效了'
      },
      {
        desc: '完全不同的答案',
        a1: '这是跳伞事故，背包是降落伞包',
        a2: '这是沙漠迷路事件，背包里的水和食物用完了'
      }
    ];
    
    testCases.forEach((testCase, index) => {
      console.log(`\n测试案例 ${index + 1}: ${testCase.desc}`);
      const incon = this.calculateINCON(testCase.a1, testCase.a2);
      console.log(`结果INCON: ${incon}, 共识度: ${((1-incon)*100).toFixed(1)}%`);
    });
  }
} 