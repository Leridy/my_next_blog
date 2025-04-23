import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Hello Boss - 用 AI 打败已读不回',
  description:
    'Hello Boss 是由划水网提供的，基于 AI（DeepSeek-V3）的智能求职沟通解决方案。通过解析用户简历与目标岗位需求，结合深度学习和自然语言处理技术，自动生成高匹配度、高回复率的定制化招呼语，精准适配Boss直聘场景下的HR、项目主管及企业创始人等不同沟通对象。',
  keywords: [
    'AI求职打招呼生成器',
    'Boss直聘高回复话术',
    '简历智能匹配开场白',
    'AI定制求职沟通话术',
    'DeepSeek-V3求职助手',
    '已读不回解决方案',
    '零经验求职破冰话术',
    '简历秒变黄金开场白',
    'HR必回消息生成工具',
    '跨行业求职话术模板',
    '多模态简历语义分析',
    'AI动态话术博弈系统',
    'NLP求职沟通优化',
    '深度学习岗位匹配引擎',
    'HR决策心理模拟算法',
    '如何让Boss直聘回复率翻倍',
    '跳槽者打招呼话术模板',
    '应届生求职第一句话怎么写',
    'AI写Boss直聘开场白工具',
    '高端人才对接创始人话术',
    'Boss直聘打招呼神器',
    '比猎聘助手更好用的AI工具',
    '智联招聘自动回复替代方案',
    '领英InMail生成器平替',
    '求职外挂黑科技工具',
    '提升210%回复率的AI工具',
    '节省85%求职时间的秘诀',
    '98%岗位需求解析技术',
    '10万+高回复话术样本库',
    'IT/金融行业定制话术',
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
