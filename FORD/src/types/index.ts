// 海龟汤谜题类型
export interface TurtleSoupPuzzle {
  id: string;
  title: string;
  description: string;
  standardAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// 辩手模型类型
export interface DebaterModel {
  id: string;
  name: string;
  displayName: string;
  capability: 'high' | 'medium' | 'low';
}

// 辩论消息类型
export interface DebateMessage {
  id: string;
  debater: string;
  content: string;
  timestamp: number;
  round: number;
}

// 不一致性指标类型
export interface InconData {
  round: number;
  value: number;
}

// 实验配置类型
export interface ExperimentConfig {
  puzzle: TurtleSoupPuzzle;
  debaterA: DebaterModel;
  debaterB: DebaterModel;
  judge: DebaterModel;
}

// 初始回答类型
export interface InitialAnswer {
  debater: string;
  answer: string;
  isCorrect: boolean;
  confidence?: number; // 可选字段，表示置信度 0-1
}

// 裁判评估类型
export interface JudgeEvaluation {
  finalAnswer: string;
  isCorrect: boolean;
  score: number;
  summary: string;
  reasoning: string;
}

// 实验结果类型
export interface ExperimentResult {
  config: ExperimentConfig;
  initialAnswers: InitialAnswer[];
  debateMessages: DebateMessage[];
  inconData: InconData[];
  judgeEvaluation: JudgeEvaluation;
  debateGain: boolean;
  totalRounds: number;
  finalAccuracy: boolean;
}

// 应用状态类型
export interface AppState {
  currentStep: number;
  experimentConfig: ExperimentConfig | null;
  initialAnswers: InitialAnswer[];
  debateMessages: DebateMessage[];
  inconData: InconData[];
  judgeEvaluation: JudgeEvaluation | null;
  isDebating: boolean;
  currentRound: number;
} 