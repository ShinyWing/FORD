# FORD多轮辩论框架演示应用

基于论文《Examining Inter-Consistency of Large Language Models Collaboration: An In-depth Analysis via Debate》的实现，提供交互式的AI协作推理演示平台。

## 📋 项目简介

本项目将学术论文中的FORD（Five-stage Organized Reasoning via Debate）框架转化为可交互的Web应用，通过海龟汤谜题演示多个AI模型如何通过辩论达成共识，并实时量化展示一致性指数（INCON）的变化过程。

### 🎯 核心功能

- **完整映射FORD框架五大阶段**：Formation → Organizing → Reasoning → Debate → Decision
- **支持多种GPT模型组合实验**：GPT-4、GPT-3.5-turbo、GPT-4-turbo
- **实时INCON指数可视化**：动态图表展示AI一致性变化
- **交互式辩论竞技场**：观看AI实时辩论过程
- **量化分析辩论增益效果**：评估协作推理价值
- **现代化响应式UI设计**：基于Ant Design的优雅界面

### 🔬 技术亮点

- **改进的INCON算法**：综合Jaccard相似度、语义匹配、长度相似度的复合指标
- **智能辩论逻辑**：上下文感知的GPT API调用，生成连贯多轮对话
- **实时数据可视化**：使用Recharts展示共识演进过程
- **完整的错误处理机制**：API调用失败时的降级策略
- **模块化架构设计**：清晰的组件分离和状态管理

## 🚀 快速开始

### 环境要求

- Node.js 16.0+
- npm 或 yarn
- OpenAI API账户

### 1. 克隆项目

```bash
git clone <repository-url>
cd ford-debate-framework
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
```

### 3. 配置API密钥

#### 方法一：使用环境变量（推荐）

1. 创建 `.env` 文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，添加你的OpenAI API密钥：
```
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

#### 方法二：使用配置文件

1. 复制配置示例文件：
```bash
cp config.example.js config.js
```

2. 编辑 `config.js` 文件，填入你的API密钥：
```javascript
export const OPENAI_API_KEY = 'your_actual_api_key_here';
```

### 4. 启动应用

```bash
npm start
# 或
yarn start
```

应用将在 `http://localhost:3000` 启动。

## 🔑 获取OpenAI API密钥

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册或登录你的账户
3. 进入 [API Keys](https://platform.openai.com/account/api-keys) 页面
4. 点击 "Create new secret key"
5. 复制生成的密钥并按照上述步骤配置

⚠️ **安全提示**：
- 永远不要将API密钥提交到版本控制系统
- 定期轮换你的API密钥
- 在生产环境中使用后端代理而非前端直接调用

## 📖 使用说明

### 实验流程

1. **选择海龟汤谜题**：从预设的谜题中选择一个进行实验
2. **配置辩手模型**：选择两个不同的GPT模型作为辩手
3. **初始评估**：获取两个AI的初始答案，计算基准INCON指数
4. **进行辩论**：观看多轮辩论过程，实时查看INCON指数变化
5. **裁判裁决**：获得最终评估和辩论增益分析
6. **查看报告**：完整的实验数据汇总和历史回顾

### 海龟汤谜题说明

海龟汤是一种逻辑推理游戏，玩家需要根据简短的描述推断出完整的故事情节。本项目使用海龟汤谜题作为测试场景，因为：

- 需要逻辑推理和创造性思维
- 答案通常有一定的开放性
- 适合观察AI模型间的观点分歧和收敛过程

### 界面说明

- **步骤导航**：顶部显示当前实验进度
- **配置面板**：左侧选择谜题和模型
- **主要内容区**：中间显示实验结果和辩论过程
- **数据可视化**：图表展示INCON指数变化
- **控制按钮**：底部提供操作按钮

## 🏗️ 项目结构

```
ford-debate-framework/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React组件
│   │   ├── ExperimentConfig.tsx      # 实验配置组件
│   │   ├── InitialEvaluation.tsx     # 初始评估组件
│   │   ├── DebateArena.tsx           # 辩论竞技场组件
│   │   ├── JudgeDecision.tsx         # 裁判裁决组件
│   │   ├── ExperimentReport.tsx      # 实验报告组件
│   │   └── HistoryModal.tsx          # 历史回顾组件
│   ├── config/            # 配置文件
│   │   └── openai.ts      # OpenAI配置
│   ├── services/          # 服务层
│   │   └── aiService.ts   # AI服务接口
│   ├── data/              # 数据文件
│   │   └── turtleSoupPuzzles.ts  # 海龟汤谜题数据
│   ├── types/             # TypeScript类型定义
│   │   └── index.ts       # 公共类型
│   ├── App.tsx            # 主应用组件
│   ├── index.tsx          # 应用入口
│   └── index.css          # 样式文件
├── 论文笔记.md            # 论文解读文档
├── 技术文档.md            # 详细技术文档
├── config.example.js      # 配置示例文件
├── package.json           # 项目依赖
└── README.md             # 项目说明
```

## 🔧 开发说明

### 技术栈

- **前端框架**：React 18 + TypeScript
- **UI组件库**：Ant Design
- **图表库**：Recharts
- **AI服务**：OpenAI GPT API
- **构建工具**：Create React App

### 核心算法

#### INCON指数计算

```typescript
INCON = 1 - (α × Jaccard相似度 + β × 关键概念相似度 + γ × 长度相似度)
```

其中：
- α = 0.4（词汇重叠权重）
- β = 0.4（语义匹配权重）  
- γ = 0.2（长度相似度权重）

#### 辩论逻辑

- 基于上下文感知的多轮对话生成
- 动态调整辩论策略和重点
- 智能识别共识点和分歧点

### 自定义开发

如需扩展项目功能，可以：

1. **添加新的谜题**：在 `src/data/turtleSoupPuzzles.ts` 中添加新的谜题数据
2. **支持新模型**：在 `src/config/openai.ts` 中添加新的模型配置
3. **改进算法**：在 `src/services/aiService.ts` 中优化INCON计算算法
4. **扩展UI**：在 `src/components/` 中添加新的界面组件

## 🔍 故障排除

### 常见问题

1. **API密钥错误**
   - 检查 `.env` 文件中的密钥是否正确
   - 确认API密钥有效且有足够的额度

2. **网络连接问题**
   - 检查网络连接是否正常
   - 确认能够访问OpenAI API服务

3. **依赖安装失败**
   - 清除 `node_modules` 和 `package-lock.json`
   - 重新运行 `npm install`

4. **页面加载缓慢**
   - 检查网络状况
   - 考虑使用VPN或代理

### 调试模式

启用调试模式查看详细日志：

```bash
npm start -- --verbose
```

## 📚 相关文档

- **[论文笔记](./论文笔记.md)**：原论文的详细解读
- **[技术文档](./技术文档.md)**：完整的技术实现文档
- **[OpenAI API文档](https://platform.openai.com/docs)**：OpenAI API使用说明

## 🤝 贡献指南

欢迎贡献代码和改进建议！请遵循以下步骤：

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目基于MIT许可证开源。详见 [LICENSE](./LICENSE) 文件。

## 🙏 致谢

- 感谢原论文作者的研究贡献
- 感谢OpenAI提供的API服务
- 感谢开源社区的支持

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](../../issues)
- 发起 [Discussion](../../discussions)

---

**注意**：本项目仅供学术研究和教育目的使用。使用OpenAI API需要遵守相关服务条款和使用政策。