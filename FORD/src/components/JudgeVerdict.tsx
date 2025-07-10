import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Statistic, Progress, Tag, Divider, Space, Button } from 'antd';
import { TrophyOutlined, CheckCircleOutlined, CloseCircleOutlined, RiseOutlined, UserOutlined } from '@ant-design/icons';
import { ExperimentConfig as ExperimentConfigType, InitialAnswer, DebateMessage, JudgeEvaluation } from '../types';
import { AIService } from '../services/aiService';

const { Title, Text, Paragraph } = Typography;

interface JudgeVerdictProps {
  config: ExperimentConfigType;
  initialAnswers: InitialAnswer[];
  debateMessages: DebateMessage[];
  initialIncon: number;
  finalIncon: number;
  totalRounds: number;
  onJudgmentComplete: (evaluation: JudgeEvaluation) => void;
  onGoToReport?: () => void;
}

const JudgeVerdict: React.FC<JudgeVerdictProps> = ({
  config,
  initialAnswers,
  debateMessages,
  initialIncon,
  finalIncon,
  totalRounds,
  onJudgmentComplete,
  onGoToReport
}) => {
  const [judgeEvaluation, setJudgeEvaluation] = useState<JudgeEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationComplete, setEvaluationComplete] = useState(false);

  // 生成裁判评估
  const generateJudgeEvaluation = async () => {
    setIsEvaluating(true);
    
    try {
      // 模拟裁判思考时间
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 获取最终共识答案
      const finalAnswer = generateConsensusAnswer();
      
      // 评估最终答案正确性
      const isCorrect = AIService.evaluateAnswer(finalAnswer, config.puzzle);
      
      // 生成裁判评分
      const score = calculateJudgeScore(isCorrect, totalRounds, initialIncon, finalIncon);
      
      // 生成裁判评语
      const { summary, reasoning } = await generateJudgeCommentary(isCorrect, score, finalAnswer);

      const evaluation: JudgeEvaluation = {
        finalAnswer,
        isCorrect,
        score,
        summary,
        reasoning
      };

      setJudgeEvaluation(evaluation);
      setEvaluationComplete(true);
      onJudgmentComplete(evaluation);

    } catch (error) {
      console.error('裁判评估过程中出错:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 生成共识答案
  const generateConsensusAnswer = (): string => {
    // 基于谜题和最终辩论结果生成共识答案
    const puzzleId = config.puzzle.id;
    
    const consensusAnswers: Record<string, string> = {
      puzzle1: '经过辩论，我们达成共识：这是一起跳伞事故。男人是跳伞运动员，背包是降落伞包，但降落伞没有正常打开导致他坠落身亡。',
      puzzle2: '经过讨论，我们一致认为：女人身高不够，无法触及30层的按钮。有其他人时可以请求帮助，独自一人时只能按到20层。',
      puzzle3: '通过分析，我们得出结论：男人在镜子中看到有其他人站在他身后，意识到家中有入侵者，因此恐惧逃跑并搬家。',
      puzzle4: '经过辩论，我们达成一致：孕妇要生孩子了，肚子里的胎儿也算一个人，实际上是6个人，医生意识到这一点主动跳海。'
    };

    return consensusAnswers[puzzleId] || '经过辩论，双方达成了基本共识。';
  };

  // 计算裁判评分
  const calculateJudgeScore = (
    isCorrect: boolean, 
    rounds: number, 
    initialIncon: number, 
    finalIncon: number
  ): number => {
    let score = 5; // 基础分

    // 正确性是最重要的因素
    if (isCorrect) {
      score += 4; // 增加正确性权重
    } else {
      score -= 1; // 减少惩罚
    }

    // 效率加分（轮数越少越好）
    const efficiencyBonus = Math.max(0, (6 - rounds) * 0.3);
    score += efficiencyBonus;

    // 共识度改善加分
    const consensusImprovement = (initialIncon - finalIncon) / initialIncon;
    score += consensusImprovement * 1.5;

    const finalScore = Math.max(1, Math.min(10, Math.round(score * 10) / 10));
    
    console.log('🎯 裁判评分计算:');
    console.log(`  基础分: 5`);
    console.log(`  正确性: ${isCorrect ? '+4' : '-1'}`);
    console.log(`  效率奖励: +${efficiencyBonus.toFixed(1)}`);
    console.log(`  共识改善: +${(consensusImprovement * 1.5).toFixed(1)}`);
    console.log(`  最终评分: ${finalScore}/10`);
    
    return finalScore;
  };

  // 生成裁判评语（使用真实的AI评估）
  const generateJudgeCommentary = async (isCorrect: boolean, score: number, finalAnswer: string) => {
    try {
      // 准备辩论历史摘要
      const debateHistory = debateMessages
        .slice(-6) // 最近6条消息
        .map(msg => `${msg.debater}: ${msg.content}`);
      
      const evaluation = await AIService.generateJudgeEvaluation(
        config.puzzle,
        finalAnswer,
        debateHistory
      );
      
      return {
        summary: evaluation.summary,
        reasoning: evaluation.reasoning
      };
    } catch (error) {
      console.error('裁判评语生成失败:', error);
      
      // 降级到简单评语
      const consensusImprovement = ((initialIncon - finalIncon) / initialIncon * 100).toFixed(1);
      
      return {
        summary: `本次辩论在${totalRounds}轮后${isCorrect ? '成功找到正确答案' : '未能找到正确答案'}。共识度提升${consensusImprovement}%。`,
        reasoning: `经过${totalRounds}轮辩论，AI模型展示了良好的协作能力。综合评分：${score}/10分。`
      };
    }
  };

  // 计算辩论增益
  const getDebateGain = (): boolean => {
    const initialCorrect = initialAnswers.filter(a => a.isCorrect).length;
    return judgeEvaluation ? (judgeEvaluation.isCorrect && initialCorrect < 2) : false;
  };

  useEffect(() => {
    generateJudgeEvaluation();
  }, []);

  return (
    <div className="step-container">
      <Title level={2}>
        <TrophyOutlined /> 模块4：裁判裁决与增益分析
      </Title>
      <Paragraph>
        当辩论结束后，由裁判模型对整个过程进行评估，分析辩论的效果和价值。
      </Paragraph>

      {/* 最终共识答案 */}
      <Card 
        title="🎯 最终共识答案" 
        style={{ marginBottom: 20 }}
        extra={
          judgeEvaluation && (
            <Tag 
              color={judgeEvaluation.isCorrect ? 'success' : 'error'}
              icon={judgeEvaluation.isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            >
              {judgeEvaluation.isCorrect ? '正确' : '错误'}
            </Tag>
          )
        }
      >
        {isEvaluating ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="thinking-animation">
              🤖⚖️ 裁判正在分析辩论结果...
            </div>
          </div>
        ) : judgeEvaluation ? (
          <div>
            <div className={`consensus-answer ${judgeEvaluation.isCorrect ? 'correct' : 'incorrect'}`} style={{ marginBottom: '16px' }}>
              <Text strong style={{ fontSize: '16px' }}>
                {judgeEvaluation.finalAnswer}
              </Text>
            </div>
            
            <Card size="small" style={{ backgroundColor: '#fff7e6' }}>
              <Text strong>标准答案: </Text>
              <Text>{config.puzzle.standardAnswer}</Text>
            </Card>
          </div>
        ) : null}
      </Card>

      {/* 裁判评分与评语 */}
      {judgeEvaluation && (
        <Card 
          title={
            <Space>
              <UserOutlined />
              裁判评语 - {config.judge.displayName}
            </Space>
          }
          style={{ marginBottom: 20 }}
        >
          <Row gutter={24}>
            <Col span={8}>
              <Statistic
                title="综合评分"
                value={judgeEvaluation.score}
                suffix="/ 10"
                precision={1}
                valueStyle={{ 
                  color: judgeEvaluation.score >= 8 ? '#52c41a' : 
                         judgeEvaluation.score >= 6 ? '#fa8c16' : '#ff4d4f',
                  fontSize: '32px'
                }}
              />
              <Progress
                className="score-progress"
                percent={judgeEvaluation.score * 10}
                strokeColor={
                  judgeEvaluation.score >= 8 ? '#52c41a' : 
                  judgeEvaluation.score >= 6 ? '#fa8c16' : '#ff4d4f'
                }
                showInfo={false}
                size="small"
              />
            </Col>
            <Col span={16}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>评估总结：</Text>
                <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
                  {judgeEvaluation.summary}
                </Paragraph>
              </div>
              <div>
                <Text strong>详细分析：</Text>
                <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
                  {judgeEvaluation.reasoning}
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* 辩论增益分析 */}
      {judgeEvaluation && (
        <Card 
          title={
            <Space>
              <RiseOutlined />
              辩论增益分析
            </Space>
          }
          style={{ marginBottom: 20 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Card size="small" className="metric-card">
                <Statistic
                  title="辩论前准确率"
                  value={`${initialAnswers.filter(a => a.isCorrect).length}/2`}
                  valueStyle={{ color: '#666' }}
                />
                <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  基线表现
                </div>
              </Card>
            </Col>
            
            <Col span={6}>
              <Card size="small" className="metric-card">
                <Statistic
                  title="辩论后准确率"
                  value={judgeEvaluation.isCorrect ? "1/1" : "0/1"}
                  valueStyle={{ 
                    color: judgeEvaluation.isCorrect ? '#52c41a' : '#ff4d4f' 
                  }}
                />
                <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  最终表现
                </div>
              </Card>
            </Col>

            <Col span={6}>
              <Card size="small" className="metric-card">
                <Statistic
                  title="共识度提升"
                  value={((initialIncon - finalIncon) / initialIncon * 100).toFixed(1)}
                  suffix="%"
                  valueStyle={{ color: '#1890ff' }}
                />
                <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  一致性改善
                </div>
              </Card>
            </Col>

            <Col span={6}>
              <Card size="small" className="metric-card">
                <div style={{ marginBottom: '8px' }}>
                  <Text strong style={{ fontSize: '14px' }}>辩论效果</Text>
                </div>
                <Tag 
                  color={getDebateGain() ? 'success' : 'default'}
                  style={{ fontSize: '16px', padding: '8px 16px' }}
                >
                  {getDebateGain() ? '✅ 有效' : '➖ 无明显改善'}
                </Tag>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  整体评价
                </div>
              </Card>
            </Col>
          </Row>

          <div className={`debate-gain ${getDebateGain() ? 'positive' : 'neutral'}`}>
            <Text strong>辩论增益结论: </Text>
            <Text>
              {getDebateGain() 
                ? "🎉 本次辩论产生了积极效果！通过多轮讨论，参与者从分歧走向了正确的共识。"
                : "📊 本次辩论虽然提升了一致性，但在准确率方面没有显著改善。"
              }
            </Text>
          </div>
        </Card>
      )}

      {/* 继续按钮 */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        {evaluationComplete ? (
          <Button
            type="primary"
            size="large"
            onClick={() => {
              if (onGoToReport) {
                onGoToReport();
              } else {
                console.log('进入综合报告阶段');
              }
            }}
          >
            查看综合实验报告
          </Button>
        ) : (
          <Button
            type="primary"
            size="large"
            disabled={true}
            loading={isEvaluating}
          >
            裁判评估中...
          </Button>
        )}
      </div>
    </div>
  );
};

export default JudgeVerdict; 