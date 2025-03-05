import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DeleteOutlined, InfoCircleOutlined, LoadingOutlined, MessageOutlined, SendOutlined } from '@ant-design/icons';
import { IoMdRefresh } from 'react-icons/io';
import { Button, message, Modal, Tooltip } from 'antd';
import { useUserContext } from '@/Provider/UserProvider';
import { useNewsContext } from '@/Provider/NewsProvider';
import MarkdownRenderer from '@/Components/MarkDownRender';
import useStreamApi, { parseSSEData } from '@/app/manage/hooks/useStreamApi';
import { isDevelopment } from '@/utils/constant';

type role = 'user' | 'assistant' | 'system';

// ai response
interface LogProbToken {
  token: string;
  logprob: number;
  bytes: number[];
}

interface ContentLogProb {
  token: string;
  logprob: number;
  bytes: number[];
  top_logprobs: LogProbToken[];
}

interface FunctionCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface Message {
  content: string;
  reasoning_content?: string;
  tool_calls?: FunctionCall[];
  role: role;
}

interface Choice {
  finish_reason: string;
  index: number;
  message: Message;
  delta: Message;
  logprobs: {
    content: ContentLogProb[];
  };
}

interface CompletionTokensDetails {
  reasoning_tokens: number;
}

interface Usage {
  completion_tokens: number;
  prompt_tokens: number;
  prompt_cache_hit_tokens: number;
  prompt_cache_miss_tokens: number;
  total_tokens: number;
  completion_tokens_details: CompletionTokensDetails;
}

interface ChatResponse {
  id: string;
  choices: Choice[];
  created: number;
  model: string;
  system_fingerprint: string;
  object: 'chat.completion';
  usage: Usage;
}

// 类型定义
interface Message {
  id: string;
  role: role;
  content: string;
  timestamp: number;
}

interface LinkData {
  title: string;
  id: string;
}

export interface LinkCategory {
  title: string;
  type: string;
  links: LinkData[];
}

interface DeepSeekChatProps {
  width?: string | number;
  height?: string | number;
  customPromptTemplate?: (links: LinkCategory[]) => string;
  apiEndpoint?: string;
  apiKey?: string;
  modelName?: string;
  modalMode?: boolean;
}

// 在组件内添加<style>标签或在外部CSS文件中添加
const scrollContainerStyle = `
  .scroll-container {
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  
  .scroll-container::-webkit-scrollbar {
    width: 6px;
  }
  
  .scroll-container::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scroll-container::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 3px;
  }
`;

// 默认提示词模板
const defaultPromptTemplate = (linksCategories: LinkCategory[], username: string): string => {
  if (!linksCategories || linksCategories.length === 0 || !username) return '';

  return `
用户名是 ${username}, 你回复的第一条消息要和用户打招呼问候，介绍你能做什么。

你是一个帮助用户在[划水网](${location.href})查找信息的助手。如果你的回答包含了下面提到的内容，请提供相关链接，格式为 [链接名称](${location.href}/api/link/redirect/{链接id})。

请注意：
1. 保持礼貌友好的交流方式
2. 不使用不当语言
3. 严格保护用户隐私
4. 仅基于下方提供的链接信息回答问题
5. 遇到超出下面知识范围的问题，回复"我无法回答这个问题"或引导用户访问deepseek官网
6. 注意我的运行环境有超时限制，所以请你尽量在十秒内给我答复

以下是可参考的链接资源，请仔细阅读并记住这些信息：
${linksCategories
  .map((category) => {
    // 先创建类别标题
    const categoryHeader = `# ${category.title}\n## ${category.type}\n`;

    // 然后添加该类别下的所有链接
    const categoryLinks = category.links.map((link) => `* 标题: ${link.title} | ID: ${link.id}`).join('\n');

    // 返回完整的类别信息
    return categoryHeader + categoryLinks;
  })
  .join('\n\n')}

解析说明:
- "#" 开头的是主分类标题
- "##" 开头的是分类描述
- "*" 开头的是具体文章，格式为"t: [文章标题] | ID: [文章ID]"
- 在回答问题时，使用相关文章ID构建链接
`;
};

const DeepSeekChat: React.FC<DeepSeekChatProps> = (props) => {
  const { width = '100%', height = '850px', customPromptTemplate } = props;
  const { user } = useUserContext();
  const { categories } = useNewsContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [confirmClearVisible, setConfirmClearVisible] = useState(false);

  // 添加一个状态来存储当前的流式响应内容
  const [streamContent, setStreamContent] = useState('');

  // 添加流式 API 钩子
  const { isStreaming, streamFetch } = useStreamApi({
    apiURL: isDevelopment ? 'ai/chat' : 'https://ai.huashui.cc/api/ai/chat',
    onChunk: (chunk) => {
      try {
        // 尝试解析 JSON，若失败则当作纯文本处理

        const parsed = parseSSEData(chunk) as unknown as ChatResponse[];
        const messageChunk = parsed
          .map((response) => {
            // 取出 content 字段
            return response.choices[0].delta.content;
          })
          .join('');
        setStreamContent((prev) => prev + messageChunk);
        // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (e) {
        // 若不是 JSON，直接添加文本
        setStreamContent((prev) => prev + chunk);
      }
    },
    onComplete: (fullResponse) => {
      // 流式传输完成后，清理状态
      const allParsed = parseSSEData(fullResponse) as unknown as ChatResponse[];
      console.log('All parsed:', allParsed);
      const allMessages = allParsed.map((response) => response.choices[0].delta.content).join('');
      // 把最后一个 message 的 cotent 替换为 allMessage
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'assistant') {
          return [...prev.slice(0, -1), { ...lastMessage, content: allMessages }];
        }
        return prev;
      });
      setIsLoading(false);

      setStreamContent('');
    },
    onError: (error) => {
      console.error('Stream error:', error);

      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'assistant') {
          return [...prev.slice(0, -1), { ...lastMessage, content: '抱歉，发生了错误。请稍后再试。' }];
        }
        return prev;
      });
      setIsLoading(false);
      setStreamContent('');
    },
  });

  const scrollToBottom = () => {
    if (chatContainerRef.current && messagesEndRef.current) {
      // 使用requestAnimationFrame确保DOM更新后执行滚动
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          const { scrollHeight } = chatContainerRef.current;
          chatContainerRef.current.scrollTo({
            top: scrollHeight,
            behavior: 'smooth',
          });
        }
      });
    }
  };

  // 滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 自动调整输入框高度
  const adjustInputHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
  };

  // 生成当前时间的唯一ID
  const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 发送消息到DeepSeek API
  // 修改发送消息到DeepSeek的函数，使用流式 API
  const sendMessageToDeepSeek = async (userMessage: string, systemPrompt?: string) => {
    try {
      setIsLoading(true);
      setStreamContent(''); // 清空之前的流内容

      const requestMessages = [];

      // 添加系统提示词（只在第一次对话时）
      if (systemPrompt) {
        requestMessages.push({
          role: 'system',
          content: systemPrompt,
        });
      }

      // 添加历史消息（除了系统消息）
      messages.forEach((msg) => {
        requestMessages.push({
          role: msg.role,
          content: msg.content,
        });
      });

      // 添加用户当前消息
      requestMessages.push({
        role: 'user',
        content: userMessage,
      });

      // 创建临时的助手消息并添加到列表
      const tempAssistantMessage = {
        id: generateId(),
        role: 'assistant' as const,
        content: '',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, tempAssistantMessage]);

      // 使用流式 API 发送请求
      await streamFetch({
        messages: requestMessages,
      });
    } catch (error) {
      console.error('Error sending message to DeepSeek:', error);

      // 添加错误消息
      const errorMessage = {
        id: generateId(),
        role: 'assistant' as const,
        content: '抱歉，发生了错误。请稍后再试。',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 发送消息
  const sendMessage = () => {
    if (!inputValue.trim() || isLoading || isStreaming) return;

    const userMessage = {
      id: generateId(),
      role: 'user' as const,
      content: inputValue,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // 处理系统提示词逻辑
    const promptTemplate = customPromptTemplate || defaultPromptTemplate;
    const systemPrompt = promptTemplate(categories, user?.name || '划水玩家');
    // 重置输入框
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // 发送到DeepSeek
    sendMessageToDeepSeek(inputValue, systemPrompt);
  };

  // 清空对话
  const clearConversation = () => {
    setMessages([]);
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 响应式设计
  const containerStyles = {
    width,
    height,
    maxWidth: '100%',
  };

  return (
    <>
      <style jsx>{`
        ${scrollContainerStyle}
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col rounded-lg overflow-hidden shadow-lg bg-[var(--color-background)]"
        style={containerStyles}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-tertiary)] text-[var(--color-text-light)]">
          <div className="flex-1 h-2 rounded-full align-middle ">
            <MessageOutlined /> 智能助手
          </div>
          <div className="flex space-x-2">
            <Tooltip title="清空对话">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => setConfirmClearVisible(true)}
                className="text-[var(--color-text-light)] hover:bg-[rgba(255,255,255,0.15)]"
                size="small"
              />
            </Tooltip>
            <Tooltip title="关于助手">
              <Button
                type="text"
                icon={<InfoCircleOutlined />}
                onClick={() => setAboutModalVisible(true)}
                className="text-[var(--color-text-light)] hover:bg-[rgba(255,255,255,0.15)]"
                size="small"
              />
            </Tooltip>
          </div>
        </div>

        {/* 消息列表 */}
        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto p-4 space-y-4 scroll-container"
          style={{ overscrollBehavior: 'contain', position: 'relative' }}
        >
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)]"
            >
              <div className="p-6 rounded-full bg-[var(--color-quaternary)] mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 9H9.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 9H15.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-center mb-2 font-medium">您好！我是 DeepSeek 助手</p>
              <p className="text-center text-sm max-w-xs">我可以帮助您解答问题，并且会参考当前页面内容提供相关信息</p>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[100%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-[var(--color-quaternary)] text-[var(--color-text)]' : 'bg-[var(--color-card-background)] text-[var(--color-text)]'}`}>
                  <MarkdownRenderer
                    content={
                      // 如果是最后一条消息且是助手消息且正在加载，显示流式内容
                      isLoading && message.role === 'assistant' && index === messages.length - 1 ? streamContent || '思考中...' : message.content
                    }
                  />
                  {isLoading && message.role === 'assistant' && index === messages.length - 1 && <LoadingOutlined className="text-[var(--color-text-secondary)]" />}
                  <div className="text-xs mt-1 text-[var(--color-text-secondary)]">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div
            ref={messagesEndRef}
            style={{ height: 1, width: 1, opacity: 0 }}
          />
        </div>

        {/* 输入框 */}
        <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-transparent-background)]">
          <div className="relative rounded-lg bg-white shadow-sm">
            {user ? (
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  adjustInputHeight(e.target);
                }}
                onKeyDown={handleKeyDown}
                placeholder="输入您的问题..."
                className="w-full py-3 px-4 pr-12 rounded-lg resize-none outline-none bg-transparent text-[var(--color-text)] min-h-[44px] max-h-[120px]"
                style={{ fontSize: 'var(--text-size)' }}
                rows={1}
              />
            ) : (
              <>
                <div
                  className="w-full h-14 py-3 px-4 pr-12 rounded-lg resize-none outline-none bg-[rgba(0,0,0,0.03)] text-[var(--color-text-secondary)] min-h-[44px] cursor-not-allowed flex items-center"
                  style={{ fontSize: 'var(--text-size)' }}
                >
                  <span className="truncate">请登录后使用聊天功能</span>
                </div>
              </>
            )}

            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading || !inputValue.trim()}
                onClick={sendMessage}
                className={`absolute right-2 bottom-2 p-2 rounded-full ${inputValue.trim() ? 'text-[var(--color-success)] hover:bg-[var(--color-success-hover)] hover:text-[var(--color-success-text)]' : 'text-gray-300'} transition-all`}
              >
                {isLoading ? <LoadingOutlined /> : <SendOutlined />}
              </motion.button>
            )}
          </div>

          {user && messages.length > 0 && (
            <div className="mt-2 text-xs text-center text-[var(--color-text-secondary)]">
              <button
                onClick={clearConversation}
                className="inline-flex items-center hover:text-[var(--color-text)] transition-colors"
              >
                <IoMdRefresh className="mr-1" /> 开始新对话
              </button>
            </div>
          )}
        </div>
      </motion.div>
      {/*// 添加Modal组件*/}
      {/* 清空确认对话框 */}
      <Modal
        title="确认清空对话"
        open={confirmClearVisible}
        onOk={() => {
          clearConversation();
          setConfirmClearVisible(false);
          message.success('对话已清空');
        }}
        onCancel={() => setConfirmClearVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <p>确定要清空当前所有对话记录吗？此操作不可撤销。</p>
      </Modal>
      {/* 关于助手对话框 */}
      <Modal
        title="关于DeepSeek助手"
        open={aboutModalVisible}
        onOk={() => setAboutModalVisible(false)}
        onCancel={() => setAboutModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setAboutModalVisible(false)}
          >
            关闭
          </Button>,
        ]}
      >
        <div className="space-y-3">
          <p>DeepSeek助手是基于DeepSeek大语言模型开发的智能聊天工具。</p>
          <p>它能够：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>回答您的对本页感兴趣的问题(每天十次)</li>
            <li>自动感知当前页面内容，提供上下文相关的回答</li>
            <li>支持多轮对话，记忆上下文信息</li>
            <li>提供相关链接参考</li>
          </ul>
          <p className="text-[var(--color-text-secondary)] text-sm mt-4">版本: 1.0.0</p>
        </div>
      </Modal>
    </>
  );
};

export default DeepSeekChat;
