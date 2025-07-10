import React, { useState } from 'react';
import { Card, Select, Button, Typography, Row, Col, Divider, Tag, Radio } from 'antd';
import { ExperimentOutlined, UserOutlined, QuestionOutlined } from '@ant-design/icons';
import { TurtleSoupPuzzle, DebaterModel, ExperimentConfig as ExperimentConfigType } from '../types';
import { turtleSoupPuzzles, debaterModels, experimentPresets } from '../data/mockData';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface ExperimentConfigProps {
  onConfigComplete: (config: ExperimentConfigType) => void;
}

const ExperimentConfig: React.FC<ExperimentConfigProps> = ({ onConfigComplete }) => {
  const [selectedPuzzle, setSelectedPuzzle] = useState<TurtleSoupPuzzle | null>(null);
  const [selectedDebaterA, setSelectedDebaterA] = useState<DebaterModel | null>(null);
  const [selectedDebaterB, setSelectedDebaterB] = useState<DebaterModel | null>(null);
  const [usePreset, setUsePreset] = useState<string>('');

  const handlePresetChange = (presetName: string) => {
    setUsePreset(presetName);
    const preset = experimentPresets.find(p => p.name === presetName);
    if (preset) {
      const debaterA = debaterModels.find(m => m.id === preset.debaterA);
      const debaterB = debaterModels.find(m => m.id === preset.debaterB);
      setSelectedDebaterA(debaterA || null);
      setSelectedDebaterB(debaterB || null);
    }
  };

  const handleDebaterChange = () => {
    setUsePreset('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'blue';
    }
  };

  const getCapabilityColor = (capability: string) => {
    switch (capability) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  const isConfigComplete = selectedPuzzle && selectedDebaterA && selectedDebaterB && selectedDebaterA.id !== selectedDebaterB.id;

  const handleStartExperiment = () => {
    if (isConfigComplete) {
      const judge = debaterModels.find(m => m.capability === 'high') || debaterModels[0];
      const config: ExperimentConfigType = {
        puzzle: selectedPuzzle!,
        debaterA: selectedDebaterA!,
        debaterB: selectedDebaterB!,
        judge
      };
      onConfigComplete(config);
    }
  };

  return (
    <div className="step-container">
      <Title level={2}>
        <ExperimentOutlined /> 模块1：实验参数设定
      </Title>
      <Paragraph>
        配置FORD多轮辩论框架实验参数，选择海龟汤谜题和辩手模型组合。
      </Paragraph>

      {/* 谜题选择 */}
      <Card title={<><QuestionOutlined /> 选择海龟汤谜题</>} style={{ marginBottom: 20 }}>
        <Select
          style={{ width: '100%' }}
          placeholder="请选择一个海龟汤谜题"
          value={selectedPuzzle?.id}
          onChange={(value) => {
            const puzzle = turtleSoupPuzzles.find(p => p.id === value);
            setSelectedPuzzle(puzzle || null);
          }}
        >
          {turtleSoupPuzzles.map(puzzle => (
            <Option key={puzzle.id} value={puzzle.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{puzzle.title}</span>
                <Tag color={getDifficultyColor(puzzle.difficulty)}>
                  {puzzle.difficulty === 'easy' ? '简单' : 
                   puzzle.difficulty === 'medium' ? '中等' : '困难'}
                </Tag>
              </div>
            </Option>
          ))}
        </Select>

        {selectedPuzzle && (
          <Card size="small" style={{ marginTop: 16, backgroundColor: '#f9f9f9' }}>
            <Title level={5}>{selectedPuzzle.title}</Title>
            <Paragraph>{selectedPuzzle.description}</Paragraph>
            <Text type="secondary">
              <strong>标准答案：</strong>{selectedPuzzle.standardAnswer}
            </Text>
          </Card>
        )}
      </Card>

      {/* 辩手配置 */}
      <Card title={<><UserOutlined /> 配置辩手模型</>}>
        <Title level={5}>实验组预设</Title>
        <Radio.Group value={usePreset} onChange={(e) => handlePresetChange(e.target.value)}>
          <Row gutter={16}>
            {experimentPresets.map(preset => (
              <Col span={12} key={preset.name}>
                <Radio.Button value={preset.name} style={{ width: '100%', height: 'auto', padding: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{preset.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{preset.description}</div>
                  </div>
                </Radio.Button>
              </Col>
            ))}
          </Row>
        </Radio.Group>

        <Divider>或自定义选择</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Title level={5}>辩手A</Title>
            <Select
              style={{ width: '100%' }}
              placeholder="选择辩手A模型"
              value={selectedDebaterA?.id}
              onChange={(value) => {
                const debater = debaterModels.find(m => m.id === value);
                setSelectedDebaterA(debater || null);
                handleDebaterChange();
              }}
            >
              {debaterModels.map(model => (
                <Option key={model.id} value={model.id} disabled={selectedDebaterB?.id === model.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{model.displayName}</span>
                    <Tag color={getCapabilityColor(model.capability)}>
                      {model.capability === 'high' ? '高能力' : 
                       model.capability === 'medium' ? '中等能力' : '低能力'}
                    </Tag>
                  </div>
                </Option>
              ))}
            </Select>
          </Col>

          <Col span={12}>
            <Title level={5}>辩手B</Title>
            <Select
              style={{ width: '100%' }}
              placeholder="选择辩手B模型"
              value={selectedDebaterB?.id}
              onChange={(value) => {
                const debater = debaterModels.find(m => m.id === value);
                setSelectedDebaterB(debater || null);
                handleDebaterChange();
              }}
            >
              {debaterModels.map(model => (
                <Option key={model.id} value={model.id} disabled={selectedDebaterA?.id === model.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{model.displayName}</span>
                    <Tag color={getCapabilityColor(model.capability)}>
                      {model.capability === 'high' ? '高能力' : 
                       model.capability === 'medium' ? '中等能力' : '低能力'}
                    </Tag>
                  </div>
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {selectedDebaterA && selectedDebaterB && (
          <Card size="small" style={{ marginTop: 16, backgroundColor: '#f0f9ff' }}>
            <Title level={5}>实验配置预览</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>辩手A：</Text><br />
                {selectedDebaterA.displayName}
              </Col>
              <Col span={8}>
                <Text strong>辩手B：</Text><br />
                {selectedDebaterB.displayName}
              </Col>
              <Col span={8}>
                <Text strong>裁判：</Text><br />
                GPT-4o (高能力)
              </Col>
            </Row>
          </Card>
        )}
      </Card>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Button
          type="primary"
          size="large"
          disabled={!isConfigComplete}
          onClick={handleStartExperiment}
        >
          开始实验
        </Button>
      </div>
    </div>
  );
};

export default ExperimentConfig; 