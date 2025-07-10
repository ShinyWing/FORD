import React, { useState } from 'react';
import { Card, Row, Col, Typography, Statistic, Table, Tag, Divider, Space, Button, Modal, Timeline, Collapse } from 'antd';
import { 
  FileTextOutlined, 
  TrophyOutlined, 
  LineChartOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  HistoryOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  ExperimentConfig as ExperimentConfigType, 
  InitialAnswer, 
  DebateMessage, 
  JudgeEvaluation,
  InconData 
} from '../types';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface ExperimentReportProps {
  config: ExperimentConfigType;
  initialAnswers: InitialAnswer[];
  debateMessages: DebateMessage[];
  initialIncon: number;
  finalIncon: number;
  totalRounds: number;
  judgeEvaluation: JudgeEvaluation;
  inconData: InconData[];
}

const ExperimentReport: React.FC<ExperimentReportProps> = ({
  config,
  initialAnswers,
  debateMessages,
  initialIncon,
  finalIncon,
  totalRounds,
  judgeEvaluation,
  inconData
}) => {
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('');

  // 计算统计数据
  const stats = {
    totalMessages: debateMessages.length,
    avgMessageLength: Math.round(
      debateMessages.reduce((sum, msg) => sum + msg.content.length, 0) / debateMessages.length
    ),
    consensusImprovement: ((initialIncon - finalIncon) / initialIncon * 100).toFixed(1),
    initialAccuracy: initialAnswers.filter(a => a.isCorrect).length / initialAnswers.length * 100,
    finalAccuracy: judgeEvaluation.isCorrect ? 100 : 0,
    debateEfficiency: totalRounds <= 3 ? '高效' : totalRounds <= 4 ? '适中' : '较长',
    accuracyChange: judgeEvaluation.isCorrect ? 
      (100 - (initialAnswers.filter(a => a.isCorrect).length / initialAnswers.length * 100)) :
      (0 - (initialAnswers.filter(a => a.isCorrect).length / initialAnswers.length * 100))
  };
  
  console.log('📊 实验报告统计数据:');
  console.log('  初始答案正确性:', initialAnswers.map(a => a.isCorrect));
  console.log('  最终答案正确性:', judgeEvaluation.isCorrect);
  console.log('  初始准确率:', stats.initialAccuracy + '%');
  console.log('  最终准确率:', stats.finalAccuracy + '%');
  console.log('  准确率变化:', stats.accuracyChange + '%');

  // 准备图表数据
  const roundData = inconData.map(item => ({
    round: item.round === 0 ? '初始' : `第${item.round}轮`,
    INCON: item.value,
    共识度: Math.round((1 - item.value) * 100)
  }));

  // 辩手表现数据
  const debaterPerformance = [
    {
      模型: config.debaterA.displayName,
      能力等级: config.debaterA.capability === 'high' ? '高' : '中',
      初始正确性: initialAnswers[0]?.isCorrect ? '✅' : '❌',
      参与轮数: Math.ceil(totalRounds)
    },
    {
      模型: config.debaterB.displayName,
      能力等级: config.debaterB.capability === 'high' ? '高' : '中',
      初始正确性: initialAnswers[1]?.isCorrect ? '✅' : '❌',
      参与轮数: Math.ceil(totalRounds)
    }
  ];

  const performanceColumns = [
    { title: '辩手模型', dataIndex: '模型', key: '模型' },
    { title: '能力等级', dataIndex: '能力等级', key: '能力等级' },
    { title: '初始正确性', dataIndex: '初始正确性', key: '初始正确性' },
    { title: '参与轮数', dataIndex: '参与轮数', key: '参与轮数' }
  ];

  // 构建历史回顾数据
  const buildHistoryData = () => {
    const stages = [
      {
        key: 'config',
        title: '📋 实验配置阶段',
        description: '谜题选择和AI模型配置',
        details: {
          谜题: config.puzzle.title,
          难度: config.puzzle.difficulty === 'easy' ? '简单' : 
                config.puzzle.difficulty === 'medium' ? '中等' : '困难',
          描述: config.puzzle.description,
          标准答案: config.puzzle.standardAnswer,
          辩手A: config.debaterA.displayName,
          辩手B: config.debaterB.displayName,
          裁判: config.judge.displayName
        }
      },
      {
        key: 'initial',
        title: '🎯 初始评估阶段',
        description: '获取AI初始答案并计算INCON指数',
        details: {
          初始INCON: initialIncon.toFixed(3),
          初始共识度: `${((1 - initialIncon) * 100).toFixed(1)}%`,
                     答案A: {
             内容: initialAnswers[0]?.answer || '无',
             正确性: initialAnswers[0]?.isCorrect ? '✅ 正确' : '❌ 错误',
             置信度: `${((initialAnswers[0]?.confidence || 0) * 100).toFixed(1)}%`
           },
           答案B: {
             内容: initialAnswers[1]?.answer || '无',
             正确性: initialAnswers[1]?.isCorrect ? '✅ 正确' : '❌ 错误',
             置信度: `${((initialAnswers[1]?.confidence || 0) * 100).toFixed(1)}%`
           }
        }
      },
      {
        key: 'debate',
        title: '🥊 辩论竞技场阶段',
        description: '多轮AI对话与动态INCON监控',
        details: {
          总轮数: totalRounds,
          总消息数: debateMessages.length,
          INCON变化: `${initialIncon.toFixed(3)} → ${finalIncon.toFixed(3)}`,
          共识度提升: `${stats.consensusImprovement}%`,
          辩论历史: debateMessages.map((msg, index) => ({
            轮次: `第${Math.ceil((index + 1) / 2)}轮`,
            发言者: msg.debater,
            内容: msg.content,
            时间戳: msg.timestamp
          }))
        }
      },
      {
        key: 'judge',
        title: '⚖️ 裁判裁决阶段',
        description: 'AI裁判评估辩论效果',
        details: {
          最终答案: judgeEvaluation.finalAnswer,
          正确性: judgeEvaluation.isCorrect ? '✅ 正确' : '❌ 错误',
          评分: `${judgeEvaluation.score}/10`,
          评估总结: judgeEvaluation.summary,
          详细分析: judgeEvaluation.reasoning
        }
      }
    ];

    return stages;
  };

  const historyData = buildHistoryData();

  // 显示历史详情
  const showHistoryModal = () => {
    setHistoryModalVisible(true);
  };

  // 查看特定阶段
  const viewStage = (stageKey: string) => {
    setSelectedStage(stageKey);
    setHistoryModalVisible(true);
  };

  // 渲染阶段详情
  const renderStageDetails = (stage: any) => {
    if (stage.key === 'debate') {
      return (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic title="总轮数" value={stage.details.总轮数} />
            </Col>
            <Col span={6}>
              <Statistic title="总消息数" value={stage.details.总消息数} />
            </Col>
            <Col span={6}>
              <Statistic title="INCON变化" value={stage.details.INCON变化} />
            </Col>
            <Col span={6}>
              <Statistic title="共识度提升" value={stage.details.共识度提升} />
            </Col>
          </Row>
          
          <Card title="🗨️ 辩论历史记录" size="small">
            <Timeline mode="alternate" className="history-timeline">
              {stage.details.辩论历史.map((msg: any, index: number) => (
                <Timeline.Item 
                  key={index}
                  color={msg.发言者.includes('GPT-4 (') ? '#1890ff' : '#52c41a'}
                  label={msg.轮次}
                >
                  <Card size="small" title={msg.发言者} style={{ maxWidth: 400 }}>
                    <p>{msg.内容}</p>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(msg.时间戳).toLocaleTimeString()}
                    </Text>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </div>
      );
    } else if (stage.key === 'initial') {
      return (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Card title="🤖 辩手A初始回答" size="small">
                <p><strong>内容：</strong>{stage.details.答案A.内容}</p>
                <p><strong>正确性：</strong>{stage.details.答案A.正确性}</p>
                <p><strong>置信度：</strong>{stage.details.答案A.置信度}</p>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="🤖 辩手B初始回答" size="small">
                <p><strong>内容：</strong>{stage.details.答案B.内容}</p>
                <p><strong>正确性：</strong>{stage.details.答案B.正确性}</p>
                <p><strong>置信度：</strong>{stage.details.答案B.置信度}</p>
              </Card>
            </Col>
          </Row>
          <Card title="📊 初始一致性分析" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="初始INCON指数" value={stage.details.初始INCON} />
              </Col>
              <Col span={12}>
                <Statistic title="初始共识度" value={stage.details.初始共识度} />
              </Col>
            </Row>
          </Card>
        </div>
      );
    } else {
      return (
        <div>
          {Object.entries(stage.details).map(([key, value]) => (
            <p key={key}>
              <strong>{key}：</strong>
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </p>
          ))}
        </div>
      );
    }
  };

  // 导出报告
  const exportReport = () => {
    const reportData = {
      实验配置: {
        谜题: config.puzzle.title,
        辩手A: config.debaterA.displayName,
        辩手B: config.debaterB.displayName,
        裁判: config.judge.displayName
      },
      实验结果: {
        总轮数: totalRounds,
        最终评分: judgeEvaluation.score,
        是否正确: judgeEvaluation.isCorrect,
        共识度改善: `${stats.consensusImprovement}%`
      },
      详细数据: {
        初始INCON: initialIncon,
        最终INCON: finalIncon,
        消息总数: stats.totalMessages,
        平均消息长度: stats.avgMessageLength
      }
    };

    console.log('📊 实验报告数据:', reportData);
    alert('实验报告已输出到控制台，可以复制保存！');
  };

  return (
    <div className="step-container">
      <Title level={2}>
        <FileTextOutlined /> 模块5：综合实验报告
      </Title>
      <Paragraph>
        完整的实验结果分析，包含定量指标、可视化图表和详细评估。
      </Paragraph>

      {/* 实验概览 */}
      <Card 
        title="📋 实验概览" 
        style={{ marginBottom: 20 }}
        extra={
          <Space>
            <Button icon={<HistoryOutlined />} onClick={showHistoryModal}>
              查看历史过程
            </Button>
            <Button icon={<DownloadOutlined />} onClick={exportReport}>
              导出报告
            </Button>
            <Button icon={<ShareAltOutlined />}>
              分享结果
            </Button>
          </Space>
        }
      >
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" className="metric-card">
              <Statistic
                title="谜题"
                value={config.puzzle.title}
                valueStyle={{ fontSize: '16px' }}
              />
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                难度: {config.puzzle.difficulty === 'easy' ? '简单' : 
                       config.puzzle.difficulty === 'medium' ? '中等' : '困难'}
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="metric-card">
              <Statistic
                title="辩论轮数"
                value={totalRounds}
                suffix="轮"
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                效率: {stats.debateEfficiency}
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="metric-card">
              <Statistic
                title="最终评分"
                value={judgeEvaluation.score}
                suffix="/ 10"
                precision={1}
                valueStyle={{ 
                  color: judgeEvaluation.score >= 8 ? '#52c41a' : 
                         judgeEvaluation.score >= 6 ? '#fa8c16' : '#ff4d4f'
                }}
              />
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                {judgeEvaluation.isCorrect ? '✅ 正确' : '❌ 错误'}
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 阶段回顾快捷入口 */}
      <Card title="🔄 实验阶段回顾" style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          {historyData.map((stage) => (
            <Col span={6} key={stage.key}>
              <Card 
                size="small" 
                hoverable
                onClick={() => viewStage(stage.key)}
                className="history-stage-card"
                style={{ cursor: 'pointer', height: '120px' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {stage.title.split(' ')[0]}
                  </div>
                  <Text strong>{stage.title.split(' ').slice(1).join(' ')}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {stage.description}
                  </Text>
                  <br />
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<EyeOutlined />}
                    style={{ marginTop: '8px' }}
                  >
                    查看详情
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 关键指标对比 */}
      <Row gutter={24} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Card title="📈 INCON指数变化趋势">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={roundData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="round" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="INCON" 
                  stroke="#ff4d4f" 
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="📊 共识度演进">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={roundData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="round" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="共识度" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 核心发现 */}
      <Card title="🔍 核心发现" style={{ marginBottom: 20 }}>
        <Row gutter={24}>
          <Col span={12}>
            <Card size="small" title="准确性分析">
              <div style={{ marginBottom: '12px' }}>
                <Text strong>初始准确率: </Text>
                <Tag color={stats.initialAccuracy > 50 ? 'green' : 'red'}>
                  {stats.initialAccuracy}%
                </Tag>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <Text strong>最终准确率: </Text>
                <Tag color={stats.finalAccuracy > 0 ? 'green' : 'red'}>
                  {stats.finalAccuracy}%
                </Tag>
              </div>
              <div>
                <Text strong>准确性变化: </Text>
                {stats.finalAccuracy > stats.initialAccuracy ? (
                  <Tag color="green">
                    <CheckCircleOutlined /> 提升 {stats.finalAccuracy - stats.initialAccuracy}%
                  </Tag>
                ) : stats.finalAccuracy < stats.initialAccuracy ? (
                  <Tag color="red">
                    <CloseCircleOutlined /> 下降 {stats.initialAccuracy - stats.finalAccuracy}%
                  </Tag>
                ) : (
                  <Tag color="blue">保持不变</Tag>
                )}
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="共识性分析">
              <div style={{ marginBottom: '12px' }}>
                <Text strong>初始INCON: </Text>
                <Text code>{initialIncon.toFixed(3)}</Text>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <Text strong>最终INCON: </Text>
                <Text code>{finalIncon.toFixed(3)}</Text>
              </div>
              <div>
                <Text strong>共识度提升: </Text>
                <Tag color="green">
                  +{stats.consensusImprovement}%
                </Tag>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 辩手表现 */}
      <Card title="🤖 辩手表现分析" style={{ marginBottom: 20 }}>
        <Table 
          dataSource={debaterPerformance}
          columns={performanceColumns}
          pagination={false}
          size="small"
        />
      </Card>

      {/* 裁判评价 */}
      <Card title="⚖️ 裁判最终评价" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: '16px' }}>
          <Text strong>评估总结：</Text>
          <Paragraph style={{ marginTop: '8px' }}>
            {judgeEvaluation.summary}
          </Paragraph>
        </div>
        <Divider />
        <div>
          <Text strong>详细分析：</Text>
          <Paragraph style={{ marginTop: '8px', whiteSpace: 'pre-line' }}>
            {judgeEvaluation.reasoning}
          </Paragraph>
        </div>
      </Card>

      {/* 实验结论 */}
      <Card 
        title={
          <Space>
            <TrophyOutlined />
            实验结论
          </Space>
        }
        style={{ 
          background: judgeEvaluation.isCorrect ? 
            'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)' : 
            'linear-gradient(135deg, #fff2f0 0%, #ffffff 100%)',
          border: `1px solid ${judgeEvaluation.isCorrect ? '#b7eb8f' : '#ffb3b3'}`
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {judgeEvaluation.isCorrect ? '🎉' : '🤔'}
          </div>
          <Title level={3} style={{ marginBottom: '16px' }}>
            {judgeEvaluation.isCorrect ? 
              '辩论取得成功！AI模型通过协作找到了正确答案' : 
              '实验展示了AI协作的复杂性，虽未达到完全正确但提升了共识度'
            }
          </Title>
          <Paragraph style={{ fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            通过{totalRounds}轮深入辩论，两个AI模型展示了良好的协作能力。
            共识度提升了{stats.consensusImprovement}%，证明了FORD框架的有效性。
            {judgeEvaluation.isCorrect ? 
              '这次实验完美诠释了AI协作的潜力。' : 
              '为未来的AI协作研究提供了宝贵的数据和洞察。'
            }
          </Paragraph>
        </div>
      </Card>

      {/* 历史回顾模态框 */}
      <Modal
        title="🕒 实验历史回顾"
        open={historyModalVisible}
        onCancel={() => {
          setHistoryModalVisible(false);
          setSelectedStage('');
        }}
        footer={null}
        width={1000}
        style={{ top: 20 }}
        className="history-modal"
      >
        {selectedStage ? (
          // 显示特定阶段详情
          <div>
            {(() => {
              const stage = historyData.find(s => s.key === selectedStage);
              if (!stage) return null;
              
              return (
                <div>
                  <Card title={stage.title} style={{ marginBottom: 16 }}>
                    <Text>{stage.description}</Text>
                  </Card>
                  {renderStageDetails(stage)}
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button onClick={() => setSelectedStage('')}>
                      返回总览
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          // 显示所有阶段总览
          <Collapse accordion>
            {historyData.map((stage) => (
              <Panel 
                header={stage.title} 
                key={stage.key}
                extra={
                  <Button 
                    type="link" 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStage(stage.key);
                    }}
                  >
                    详细查看
                  </Button>
                }
              >
                <p>{stage.description}</p>
                {renderStageDetails(stage)}
              </Panel>
            ))}
          </Collapse>
        )}
      </Modal>
    </div>
  );
};

export default ExperimentReport; 