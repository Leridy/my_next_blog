import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'ResuMate - 简历有AI，匹配无阻碍',
  description:
    'ResuMate 是由划水网推出的新一代AI智能招聘解决方案，基于深度语义理解（DeepSeek-V3）和机器学习算法，通过多维解析候选人简历与岗位JD需求，实现智能评分、自动分级与精准人岗匹配，为HR、招聘主管及企业主提供数据驱动的智能决策支持，提升80%初筛效率，降低53%错筛风险。',
  keywords: [
    'AI智能简历筛选系统',
    '简历与JD智能匹配工具',
    'AI人才匹配引擎',
    '深度学习简历分析',
    'DeepSeek-V3招聘算法',
    '自动化候选人筛选系统',
    '简历智能分级工具',
    '人岗匹配度精准评估',
    'AI招聘决策支持系统',
    '多维度简历语义解析',
    '智能人才画像生成器',
    '招聘效率提升解决方案',
    '简历筛选错误率降低工具',
    '机器学习招聘助手',
    'HR智能化筛选平台',
    '如何快速筛选优质简历',
    '跨行业简历评估标准',
    '应届生简历智能评估',
    '高端人才精准匹配系统',
    'AI招聘黑科技工具',
    '比传统ATS更智能的筛选系统',
    '猎头级简历筛选AI工具',
    '招聘系统智能化升级方案',
    '简历红绿灯分级系统',
    '人才竞争力AI评分',
    '提升3倍筛选效率的AI工具',
    '节省70%简历筛选时间',
    '98%岗位胜任力预测技术',
    '千万级人才数据库训练',
    'IT/金融行业智能筛选模型',
    'AI驱动的人才供应链管理',
    '候选人潜力预测算法',
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
