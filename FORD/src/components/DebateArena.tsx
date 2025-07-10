import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Typography, Timeline, Badge, Space } from 'antd';
import { MessageOutlined, LineChartOutlined, PlayCircleOutlined, PauseOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExperimentConfig as ExperimentConfigType, InitialAnswer, DebateMessage, InconData } from '../types';
import { AIService } from '../services/aiService';

const { Title, Text, Paragraph } = Typography;

interface DebateArenaProps {
  config: ExperimentConfigType;
  initialAnswers: InitialAnswer[];
  initialIncon: number;
  onDebateComplete: (messages: DebateMessage[], finalIncon: number, totalRounds: number, inconData: InconData[]) => void;
}

const DebateArena: React.FC<DebateArenaProps> = ({
  config,
  initialAnswers,
  initialIncon,
  onDebateComplete
}) => {
  const [debateMessages, setDebateMessages] = useState<DebateMessage[]>([]);
  const [inconData, setInconData] = useState<InconData[]>([{ round: 0, value: initialIncon }]);
  const [currentRound, setCurrentRound] = useState(0);
  const [isDebating, setIsDebating] = useState(false);
  const [debateComplete, setDebateComplete] = useState(false);

  // 初始化辩论消息
  useEffect(() => {
    const initialMessages: DebateMessage[] = [
      {
        id: 'initial-a',
        debater: config.debaterA.displayName,
        content: initialAnswers[0]?.answer || '',
        timestamp: Date.now() - 1000,
        round: 0
      },
      {
        id: 'initial-b',
        debater: config.debaterB.displayName,
        content: initialAnswers[1]?.answer || '',
        timestamp: Date.now(),
        round: 0
      }
    ];
    setDebateMessages(initialMessages);
  }, [config, initialAnswers]);

  // 进行下一轮辩论
  const nextRound = async () => {
    if (isDebating || debateComplete) return;

    setIsDebating(true);
    const newRound = currentRound + 1;
    setCurrentRound(newRound);

    try {
      // 获取所有之前的消息内容
      const previousMessages = debateMessages.map(msg => msg.content);

      // 顺序生成辩手回应（真实API调用需要避免过度并发）
      const responseA = await AIService.generateDebateResponse(
        config.debaterA,
        config.puzzle,
        previousMessages,
        newRound
      );

      // 获取对手最新消息作为上下文
      const opponentLastMessage = debateMessages[debateMessages.length - 1]?.content;
      
      const responseB = await AIService.generateDebateResponse(
        config.debaterB,
        config.puzzle,
        [...previousMessages, responseA],
        newRound,
        responseA
      );

      // 创建新的辩论消息
      const newMessages: DebateMessage[] = [
        {
          id: `round-${newRound}-a`,
          debater: config.debaterA.displayName,
          content: responseA,
          timestamp: Date.now(),
          round: newRound
        },
        {
          id: `round-${newRound}-b`,
          debater: config.debaterB.displayName,
          content: responseB,
          timestamp: Date.now() + 100,
          round: newRound
        }
      ];

      // 更新状态
      setDebateMessages(prev => [...prev, ...newMessages]);

      // 计算新的INCON值（传递轮数以模拟收敛）
      const newIncon = AIService.calculateINCON(responseA, responseB, newRound);
      const newInconData = { round: newRound, value: newIncon };
      setInconData(prev => [...prev, newInconData]);

      // 检查是否应该结束辩论
      if (newRound >= 5 || newIncon < 0.1) {
        setTimeout(() => {
          setDebateComplete(true);
          onDebateComplete([...debateMessages, ...newMessages], newIncon, newRound, [...inconData, newInconData]);
        }, 1000);
      }

    } catch (error) {
      console.error('辩论过程中出错:', error);
    } finally {
      setIsDebating(false);
    }
  };

  // 获取当前一致性程度
  const getCurrentConsensus = () => {
    const latestIncon = inconData[inconData.length - 1]?.value || initialIncon;
    return Math.round((1 - latestIncon) * 100);
  };

  return (
    <div className="step-container">
      <Title level={2}>
        <MessageOutlined /> 模块3：实时辩论竞技场
      </Title>
      <Paragraph>
        观察两个AI辩手通过多轮对话逐步达成共识，实时监控不一致性指数的变化。
      </Paragraph>

      <Row gutter={24}>
        {/* 左侧：辩论消息区 */}
        <Col span={14}>
          <Card 
            title={
              <Space>
                <MessageOutlined />
                辩论对话
                <Badge 
                  count={`第 ${currentRound} 轮`} 
                  style={{ backgroundColor: '#52c41a' }}
                />
              </Space>
            }
            style={{ height: '600px' }}
            bodyStyle={{ height: '520px', overflow: 'auto' }}
          >
            <Timeline mode="alternate">
              {debateMessages.map((message) => (
                <Timeline.Item
                  key={message.id}
                  color={message.debater === config.debaterA.displayName ? '#52c41a' : '#fa8c16'}
                  label={
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {message.round === 0 ? '初始回答' : `第${message.round}轮`}
                    </div>
                  }
                >
                  <Card 
                    size="small"
                    title={
                      <div style={{ fontSize: '14px' }}>
                        🤖 {message.debater}
                      </div>
                    }
                    className={`debate-message ${
                      message.debater === config.debaterA.displayName ? 'debater-a' : 'debater-b'
                    }`}
                    style={{ 
                      marginBottom: '8px',
                      borderLeft: `4px solid ${
                        message.debater === config.debaterA.displayName ? '#52c41a' : '#fa8c16'
                      }`
                    }}
                  >
                    {message.content}
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>

            {isDebating && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div className="thinking-animation">
                  🤖💭 AI辩手正在思考中...
                </div>
              </div>
            )}
          </Card>

          {/* 辩论控制 */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                icon={isDebating ? <PauseOutlined /> : <PlayCircleOutlined />}
                onClick={nextRound}
                disabled={isDebating || debateComplete}
                loading={isDebating}
              >
                {isDebating ? '辩论中...' : 
                 debateComplete ? '辩论已结束' : '下一轮辩论'}
              </Button>
              
              {debateComplete && (
                <div style={{ fontSize: '14px', color: '#52c41a', marginTop: '8px' }}>
                  ✅ 辩论已完成，即将进入裁判裁决阶段...
                </div>
              )}
            </Space>
          </div>
        </Col>

        {/* 右侧：动态指标监控 */}
        <Col span={10}>
          <Card 
            title={
              <Space>
                <LineChartOutlined />
                动态INCON指数监控
              </Space>
            }
            style={{ marginBottom: '16px' }}
          >
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={inconData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="round" 
                    label={{ value: '辩论轮数', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    label={{ value: 'INCON指数', angle: -90, position: 'insideLeft' }}
                    domain={[0, 1]}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(3), 'INCON']}
                    labelFormatter={(round) => `第${round}轮`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#1890ff" 
                    strokeWidth={3}
                    dot={{ fill: '#1890ff', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#1890ff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 实时指标 */}
          <Card title="实时指标" size="small">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>当前共识度</Text>
                <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                  {getCurrentConsensus()}%
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>当前INCON</Text>
                <Text strong style={{ fontSize: '16px' }}>
                  {(inconData[inconData.length - 1]?.value || initialIncon).toFixed(3)}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>辩论轮数</Text>
                <Text strong>{currentRound} / 5</Text>
              </div>
            </div>
          </Card>

          {/* 辩论状态 */}
          <Card title="辩论状态" size="small" style={{ marginTop: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              {debateComplete ? (
                <div>
                  <Badge status="success" />
                  <Text strong style={{ color: '#52c41a' }}>辩论已结束</Text>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    {getCurrentConsensus() >= 80 ? '已达成高度共识' :
                     getCurrentConsensus() >= 60 ? '达成基本共识' : '仍存在分歧'}
                  </div>
                </div>
              ) : isDebating ? (
                <div>
                  <Badge status="processing" />
                  <Text strong style={{ color: '#1890ff' }}>辩论进行中</Text>
                </div>
              ) : (
                <div>
                  <Badge status="default" />
                  <Text>等待下一轮</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DebateArena; 