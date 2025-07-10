import { TurtleSoupPuzzle, DebaterModel } from '../types';

// 海龟汤谜题数据
export const turtleSoupPuzzles: TurtleSoupPuzzle[] = [
  {
    id: 'puzzle1',
    title: '沙漠中的男人',
    description: '一个男人在沙漠中死亡，身边有一个背包。背包是开着的，里面是空的。发生了什么？',
    standardAnswer: '他是一个跳伞失败的人，背包是降落伞包',
    difficulty: 'medium'
  },
  {
    id: 'puzzle2',
    title: '电梯里的女人',
    description: '一个女人住在30层楼的顶层，每天早上她乘电梯下楼去上班。晚上回来时，如果有其他人在电梯里，她直接到30层；如果只有她一个人，她到20层，然后爬楼梯上去。为什么？',
    standardAnswer: '因为她身高不够，按不到30层的按钮，只有在有其他人的时候才能请别人帮忙',
    difficulty: 'easy'
  },
  {
    id: 'puzzle3',
    title: '镜子里的恐惧',
    description: '一个男人每天晚上都会照镜子，但有一天晚上，他看到镜子后立即逃跑了。第二天，他搬走了。发生了什么？',
    standardAnswer: '他看到镜子里有别人（入室盗贼或者杀手）站在他身后',
    difficulty: 'hard'
  },
  {
    id: 'puzzle4',
    title: '海上的救生艇',
    description: '一艘船沉没了，只有一个救生艇。艇上有5个人：船长、医生、律师、老人和孕妇。救生艇只能承载4个人的重量。他们决定让一个人下去。最后医生主动跳海了。为什么？',
    standardAnswer: '因为医生发现孕妇要生孩子了，孕妇肚子里的孩子也算一个人，所以实际上是6个人',
    difficulty: 'hard'
  }
];

// AI模型数据 (使用真实的OpenAI模型)
export const debaterModels: DebaterModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    displayName: 'GPT-4 (高能力)',
    capability: 'high'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4-Turbo',
    displayName: 'GPT-4 Turbo (高能力)',
    capability: 'high'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5-Turbo',
    displayName: 'GPT-3.5 Turbo (中等能力)',
    capability: 'medium'
  }
];

// 实验组配置预设
export const experimentPresets = [
  {
    name: '公平辩论组',
    description: 'GPT-4 vs GPT-4 Turbo (两个高能力模型)',
    debaterA: 'gpt-4',
    debaterB: 'gpt-4-turbo'
  },
  {
    name: '不匹配辩论组',
    description: 'GPT-4 vs GPT-3.5-Turbo (高能力 vs 中等能力)',
    debaterA: 'gpt-4',
    debaterB: 'gpt-3.5-turbo'
  },
  {
    name: '高效辩论组',
    description: 'GPT-4 Turbo vs GPT-3.5-Turbo (快速响应组合)',
    debaterA: 'gpt-4-turbo',
    debaterB: 'gpt-3.5-turbo'
  }
]; 