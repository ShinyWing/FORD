import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Typography, Spin, Tag, Progress, Statistic, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, RobotOutlined, TrophyOutlined, HistoryOutlined } from '@ant-design/icons';
import { ExperimentConfig as ExperimentConfigType, InitialAnswer } from '../types';
import { AIService, AIResponse } from '../services/aiService';

const { Title, Paragraph, Text } = Typography;

interface InitialEvaluationProps {
  config: ExperimentConfigType;
  onEvaluationComplete: (answers: InitialAnswer[], incon: number) => void;
  existingAnswers?: InitialAnswer[];
  existingIncon?: number;
}

const InitialEvaluation: React.FC<InitialEvaluationProps> = ({ 
  config, 
  onEvaluationComplete,
  existingAnswers,
  existingIncon
}) => {
  const [answerA, setAnswerA] = useState<AIResponse | null>(null);
  const [answerB, setAnswerB] = useState<AIResponse | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [incon, setIncon] = useState<number | null>(null);
  const [evaluationComplete, setEvaluationComplete] = useState(false);
  const [isHistoryMode, setIsHistoryMode] = useState(false);

  // 生成初始回答
  const generateAnswers = async () => {
    setLoadingA(true);
    setLoadingB(true);
    setEvaluationComplete(false);

    try {
      // 并行生成两个辩手的回答
      const [responseA, responseB] = await Promise.all([
        AIService.generateInitialAnswer(config.debaterA, config.puzzle),
        AIService.generateInitialAnswer(config.debaterB, config.puzzle)
      ]);

      setAnswerA(responseA);
      setAnswerB(responseB);

      // 计算不一致性指数
      const inconValue = AIService.calculateINCON(responseA.answer, responseB.answer);
      setIncon(inconValue);

      // 准备传递给父组件的数据
      const initialAnswers: InitialAnswer[] = [
        {
          debater: config.debaterA.displayName,
          answer: responseA.answer,
          isCorrect: responseA.isCorrect
        },
        {
          debater: config.debaterB.displayName,
          answer: responseB.answer,
          isCorrect: responseB.isCorrect
        }
      ];

      setTimeout(() => {
        setEvaluationComplete(true);
        onEvaluationComplete(initialAnswers, inconValue);
      }, 1000);

    } catch (error) {
      console.error('生成回答时出错:', error);
    } finally {
      setLoadingA(false);
      setLoadingB(false);
    }
  };

  useEffect(() => {
    // 如果已有历史数据，直接使用
    if (existingAnswers && existingAnswers.length > 0 && existingIncon !== undefined) {
      console.log('显示历史初始评估数据');
      setIsHistoryMode(true);
      
      // 将历史数据转换为AIResponse格式
      const responseA: AIResponse = {
        answer: existingAnswers[0].answer,
        isCorrect: existingAnswers[0].isCorrect,
        confidence: existingAnswers[0].confidence || 0.8,
        responseTime: 1500
      };
      
      const responseB: AIResponse = {
        answer: existingAnswers[1].answer,
        isCorrect: existingAnswers[1].isCorrect,
        confidence: existingAnswers[1].confidence || 0.8,
        responseTime: 1500
      };
      
      setAnswerA(responseA);
      setAnswerB(responseB);
      setIncon(existingIncon);
      setEvaluationComplete(true);
      
      // 通知父组件（虽然数据已存在，但保持接口一致性）
      onEvaluationComplete(existingAnswers, existingIncon);
    } else {
      // 没有历史数据，生成新答案
      console.log('生成新的初始评估数据');
      setIsHistoryMode(false);
      generateAnswers();
    }
  }, [existingAnswers, existingIncon]);

  const getAccuracyColor = (isCorrect: boolean) => isCorrect ? 'success' : 'error';
  const getAccuracyIcon = (isCorrect: boolean) => 
    isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />;

  return (
    <div className="step-container">
      <Title level={2}>
        <RobotOutlined /> 模块2：初始回答与基准评估
      </Title>
      <Paragraph>
        两个辩手模型并行且独立地对谜题进行回答，并评估基准准确率和初始不一致性。
      </Paragraph>

      {/* 历史模式提示 */}
      {isHistoryMode && (
        <Alert
          message="历史数据回顾"
          description={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>当前显示的是之前生成的初始评估结果，您可以查看历史数据或继续下一步实验。</span>
              <Button 
                size="small" 
                type="primary"
                onClick={() => {
                  setIsHistoryMode(false);
                  generateAnswers();
                }}
                disabled={loadingA || loadingB}
              >
                重新生成答案
              </Button>
            </div>
          }
          type="info"
          icon={<HistoryOutlined />}
          showIcon
          closable
          style={{ marginBottom: 20 }}
        />
      )}

      {/* 谜题回顾 */}
      <Card 
        title="当前谜题" 
        size="small" 
        style={{ marginBottom: 20, backgroundColor: '#f0f9ff' }}
      >
        <Title level={5}>{config.puzzle.title}</Title>
        <Text>{config.puzzle.description}</Text>
      </Card>

      {/* 初始回答展示 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RobotOutlined />
                辩手A: {config.debaterA.displayName}
              </div>
            }
            extra={
              answerA && (
                <Tag 
                  color={getAccuracyColor(answerA.isCorrect)}
                  icon={getAccuracyIcon(answerA.isCorrect)}
                >
                  {answerA.isCorrect ? '正确' : '错误'}
                </Tag>
              )
            }
            style={{ height: '100%' }}
          >
            {loadingA ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">正在生成回答...</Text>
                </div>
              </div>
            ) : answerA ? (
              <div>
                <div className="debate-message debater-a">
                  {answerA.answer}
                </div>
                <div style={{ marginTop: 12, fontSize: '12px', color: '#666' }}>
                  <div>置信度: {(answerA.confidence * 100).toFixed(1)}%</div>
                  <div>响应时间: {answerA.responseTime}ms</div>
                </div>
              </div>
            ) : null}
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RobotOutlined />
                辩手B: {config.debaterB.displayName}
              </div>
            }
            extra={
              answerB && (
                <Tag 
                  color={getAccuracyColor(answerB.isCorrect)}
                  icon={getAccuracyIcon(answerB.isCorrect)}
                >
                  {answerB.isCorrect ? '正确' : '错误'}
                </Tag>
              )
            }
            style={{ height: '100%' }}
          >
            {loadingB ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">正在生成回答...</Text>
                </div>
              </div>
            ) : answerB ? (
              <div>
                <div className="debate-message debater-b">
                  {answerB.answer}
                </div>
                <div style={{ marginTop: 12, fontSize: '12px', color: '#666' }}>
                  <div>置信度: {(answerB.confidence * 100).toFixed(1)}%</div>
                  <div>响应时间: {answerB.responseTime}ms</div>
                </div>
              </div>
            ) : null}
          </Card>
        </Col>
      </Row>

      {/* 基准评估 */}
      {answerA && answerB && (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrophyOutlined />
              基准评估结果 (t=0状态)
            </div>
          }
          style={{ marginBottom: 20 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="辩手A初始准确率"
                value={answerA.isCorrect ? '正确' : '错误'}
                valueStyle={{ 
                  color: answerA.isCorrect ? '#3f8600' : '#cf1322',
                  fontSize: '18px'
                }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="辩手B初始准确率"
                value={answerB.isCorrect ? '正确' : '错误'}
                valueStyle={{ 
                  color: answerB.isCorrect ? '#3f8600' : '#cf1322',
                  fontSize: '18px'
                }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="初始不一致性 (INCON @ t=0)"
                value={incon || 0}
                precision={3}
                valueStyle={{ 
                  color: '#1890ff',
                  fontSize: '18px'
                }}
                suffix="/ 1.0"
              />
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  一致性程度
                </div>
                <Progress
                  type="circle"
                  size={60}
                  percent={Math.round((1 - (incon || 0)) * 100)}
                  format={percent => `${percent}%`}
                  strokeColor={
                    (incon || 0) > 0.7 ? '#cf1322' : 
                    (incon || 0) > 0.4 ? '#fa8c16' : '#3f8600'
                  }
                />
              </div>
            </Col>
          </Row>

          <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
            <Text strong>评估说明: </Text>
            <Text type="secondary">
              INCON指数反映了两个回答的语义差异程度，数值越高表示观点越不一致。
              {incon && incon > 0.7 && ' 当前显示高度不一致，辩论很有必要。'}
              {incon && incon > 0.4 && incon <= 0.7 && ' 当前显示中等不一致，通过辩论可能达成共识。'}
              {incon && incon <= 0.4 && ' 当前显示较低不一致，两个模型观点相对接近。'}
            </Text>
          </div>
        </Card>
      )}

      {/* 标准答案对比 */}
      {answerA && answerB && (
        <Card 
          title="标准答案对比" 
          size="small"
          style={{ marginBottom: 20 }}
        >
          <div style={{ padding: '12px', backgroundColor: '#fff7e6', borderRadius: '6px' }}>
            <Text strong>标准答案: </Text>
            <Text>{config.puzzle.standardAnswer}</Text>
          </div>
        </Card>
      )}

      {/* 继续按钮 */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        {evaluationComplete ? (
          <div>
            <Button
              type="primary"
              size="large"
              disabled={true}
              style={{ marginBottom: '12px' }}
            >
              ✅ 评估完成，即将进入辩论阶段
            </Button>
            <div style={{ fontSize: '14px', color: '#666' }}>
              系统将自动进入实时辩论竞技场...
            </div>
          </div>
        ) : (
          <Button
            type="primary"
            size="large"
            disabled={true}
            loading={loadingA || loadingB}
          >
            评估中...
          </Button>
        )}
      </div>
    </div>
  );
};

export default InitialEvaluation; 