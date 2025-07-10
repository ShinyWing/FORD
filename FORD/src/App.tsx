import React, { useState } from 'react';
import { Layout, Steps, Typography, Button, Space, Alert } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined, HistoryOutlined } from '@ant-design/icons';
import ExperimentConfig from './components/ExperimentConfig';
import InitialEvaluation from './components/InitialEvaluation';
import DebateArena from './components/DebateArena';
import JudgeVerdict from './components/JudgeVerdict';
import ExperimentReport from './components/ExperimentReport';
import { ExperimentConfig as ExperimentConfigType, InitialAnswer, DebateMessage, JudgeEvaluation, InconData } from './types';
import './services/apiTest'; // 自动执行API检测

const { Header, Content } = Layout;
const { Title } = Typography;
const { Step } = Steps;

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [experimentConfig, setExperimentConfig] = useState<ExperimentConfigType | null>(null);
  const [initialAnswers, setInitialAnswers] = useState<InitialAnswer[]>([]);
  const [initialIncon, setInitialIncon] = useState<number>(0);
  const [debateMessages, setDebateMessages] = useState<DebateMessage[]>([]);
  const [finalIncon, setFinalIncon] = useState<number>(0);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [judgeEvaluation, setJudgeEvaluation] = useState<JudgeEvaluation | null>(null);
  const [inconData, setInconData] = useState<InconData[]>([]);

  const steps = [
    {
      title: '实验参数设定',
      description: '选择谜题和辩手模型'
    },
    {
      title: '初始回答与基准评估',
      description: '获取初始答案并评估'
    },
    {
      title: '实时辩论竞技场',
      description: '多轮辩论与动态监控'
    },
    {
      title: '裁判裁决与增益分析',
      description: '最终裁决和效果分析'
    },
    {
      title: '综合实验报告',
      description: '完整实验结果汇总'
    }
  ];

  const handleConfigComplete = (config: ExperimentConfigType) => {
    setExperimentConfig(config);
    setCurrentStep(1);
    console.log('实验配置已完成:', config);
  };

  const handleEvaluationComplete = (answers: InitialAnswer[], incon: number) => {
    setInitialAnswers(answers);
    setInitialIncon(incon);
    console.log('初始评估完成:', { answers, incon });
    // 自动进入辩论阶段
    setTimeout(() => {
      setCurrentStep(2);
    }, 2000);
  };

  const handleDebateComplete = (messages: DebateMessage[], finalInconValue: number, rounds: number, inconHistory: InconData[]) => {
    setDebateMessages(messages);
    setFinalIncon(finalInconValue);
    setTotalRounds(rounds);
    setInconData(inconHistory);
    console.log('辩论完成:', { messages: messages.length, finalInconValue, rounds, inconHistory });
    // 进入裁决阶段
    setTimeout(() => {
      setCurrentStep(3);
    }, 1500);
  };

  const handleJudgmentComplete = (evaluation: JudgeEvaluation) => {
    setJudgeEvaluation(evaluation);
    console.log('裁判评估完成:', evaluation);
    // 可以选择自动进入下一阶段
    // setTimeout(() => {
    //   setCurrentStep(4);
    // }, 2000);
  };

  const handleGoToReport = () => {
    setCurrentStep(4);
    console.log('进入综合实验报告阶段');
  };

  // 导航控制函数
  const navigateToStep = (step: number) => {
    // 验证是否可以导航到该步骤
    if (step < 0 || step > 4) return;
    
    // 如果用户想要回到之前的步骤，直接允许（用于查看历史）
    if (step < currentStep) {
      setCurrentStep(step);
      console.log(`回到步骤 ${step}: ${steps[step].title}`);
      return;
    }
    
    // 如果用户想要前进到新步骤，则检查必要条件
    if (step > currentStep) {
      // 检查必要的数据是否存在
      if (step >= 1 && !experimentConfig) {
        alert('请先完成实验配置！');
        return;
      }
      if (step >= 2 && initialAnswers.length === 0) {
        alert('请先完成初始评估！');
        return;
      }
      if (step >= 3 && debateMessages.length === 0) {
        alert('请先完成辩论环节！');
        return;
      }
      if (step >= 4 && !judgeEvaluation) {
        alert('请先完成裁判裁决！');
        return;
      }
    }
    
    setCurrentStep(step);
    console.log(`导航到步骤 ${step}: ${steps[step].title}`);
  };

  // 重置实验
  const resetExperiment = () => {
    if (window.confirm('确定要重置整个实验吗？这将清除所有数据。')) {
      setCurrentStep(0);
      setExperimentConfig(null);
      setInitialAnswers([]);
      setInitialIncon(0);
      setDebateMessages([]);
      setFinalIncon(0);
      setTotalRounds(0);
      setJudgeEvaluation(null);
      setInconData([]);
      console.log('实验已重置');
    }
  };

  // 判断步骤是否可访问
  const isStepAccessible = (step: number): boolean => {
    if (step === 0) return true;
    
    // 如果是回到之前的步骤，只要有基本配置就可以
    if (step <= currentStep) {
      if (step === 1) return !!experimentConfig;
      if (step === 2) return !!experimentConfig && initialAnswers.length > 0;
      if (step === 3) return !!experimentConfig && initialAnswers.length > 0 && debateMessages.length > 0;
      if (step === 4) return !!experimentConfig && initialAnswers.length > 0 && debateMessages.length > 0 && !!judgeEvaluation;
    }
    
    // 如果是前进到新步骤，需要满足完整条件
    if (step > currentStep) {
      if (step === 1) return !!experimentConfig;
      if (step === 2) return !!experimentConfig && initialAnswers.length > 0;
      if (step === 3) return !!experimentConfig && initialAnswers.length > 0 && debateMessages.length > 0;
      if (step === 4) return !!experimentConfig && initialAnswers.length > 0 && debateMessages.length > 0 && !!judgeEvaluation;
    }
    
    return false;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <ExperimentConfig onConfigComplete={handleConfigComplete} />;
      case 1:
        return experimentConfig ? (
          <InitialEvaluation 
            config={experimentConfig}
            onEvaluationComplete={handleEvaluationComplete}
            existingAnswers={initialAnswers.length > 0 ? initialAnswers : undefined}
            existingIncon={initialIncon > 0 ? initialIncon : undefined}
          />
        ) : null;
      case 2:
        return experimentConfig && initialAnswers.length > 0 ? (
          <DebateArena
            config={experimentConfig}
            initialAnswers={initialAnswers}
            initialIncon={initialIncon}
            onDebateComplete={handleDebateComplete}
          />
        ) : null;
      case 3:
        return experimentConfig && initialAnswers.length > 0 && debateMessages.length > 0 ? (
          <JudgeVerdict
            config={experimentConfig}
            initialAnswers={initialAnswers}
            debateMessages={debateMessages}
            initialIncon={initialIncon}
            finalIncon={finalIncon}
            totalRounds={totalRounds}
            onJudgmentComplete={handleJudgmentComplete}
            onGoToReport={handleGoToReport}
          />
        ) : null;
      case 4:
        return experimentConfig && initialAnswers.length > 0 && debateMessages.length > 0 && judgeEvaluation ? (
          <ExperimentReport
            config={experimentConfig}
            initialAnswers={initialAnswers}
            debateMessages={debateMessages}
            initialIncon={initialIncon}
            finalIncon={finalIncon}
            totalRounds={totalRounds}
            judgeEvaluation={judgeEvaluation}
            inconData={inconData}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Header style={{ background: '#fff', padding: '0 50px', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={3} style={{ margin: '16px 0' }}>
          FORD多轮辩论框架演示应用
        </Title>
      </Header>
      
      <Content style={{ padding: '20px' }}>
        <div className="debate-container">
          {/* 导航控制栏 */}
          {currentStep > 0 && (
            <Alert
              message="实验进行中"
              description={
                <Space wrap>
                  <span>当前步骤：{steps[currentStep].title}</span>
                  <Button 
                    size="small" 
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigateToStep(currentStep - 1)}
                    disabled={currentStep === 0}
                  >
                    上一步
                  </Button>
                  <Button 
                    size="small" 
                    icon={<HistoryOutlined />}
                    onClick={() => navigateToStep(4)}
                    disabled={!isStepAccessible(4)}
                  >
                    查看报告
                  </Button>
                  <Button 
                    size="small" 
                    icon={<ReloadOutlined />}
                    onClick={resetExperiment}
                    danger
                  >
                    重置实验
                  </Button>
                </Space>
              }
              type="info"
              closable
              className="step-navigation-alert"
              style={{ marginBottom: 20 }}
            />
          )}

          <Steps current={currentStep} style={{ marginBottom: 30 }} onChange={navigateToStep}>
            {steps.map((step, index) => (
              <Step
                key={index}
                title={step.title}
                description={step.description}
                disabled={!isStepAccessible(index)}
                style={{ 
                  cursor: isStepAccessible(index) ? 'pointer' : 'not-allowed',
                  opacity: isStepAccessible(index) ? 1 : 0.5
                }}
              />
            ))}
          </Steps>

          {renderCurrentStep()}
        </div>
      </Content>
    </Layout>
  );
}

export default App; 