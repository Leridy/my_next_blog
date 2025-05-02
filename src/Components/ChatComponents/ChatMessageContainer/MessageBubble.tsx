'use client';
import React, { FC, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { CopyOutlined, CheckOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import mermaid from 'mermaid';
import { Message } from '@/IndexedDB/AIChat/types';
import { AIChatContextType } from '@/Provider/AIChatProvider/AIChatProvider';
import { useUserContext } from '@/Provider/UserProvider';
import { Spin, Tooltip, Button, message as antdMessage } from 'antd';
import Avatar from '@/Components/NavBar/Avatar';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: { useMaxWidth: true, htmlLabels: true },
});

interface MessageBubbleProps {
  message: Message;
  isPending?: boolean;
  updateMessage: AIChatContextType['updateMessage'];
  deleteMessage: AIChatContextType['deleteMessage'];
}

const MessageBubble: FC<MessageBubbleProps> = ({ message, isPending, updateMessage, deleteMessage }) => {
  const { user } = useUserContext();
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (mermaidRef.current && message.content.includes('graph')) {
      try {
        mermaid.init(undefined, mermaidRef.current);
      } catch (e) {
        console.error('Mermaid rendering error:', e);
      }
    }
  }, [message.content]);

  const isAI = message.role === 'assistant';

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    antdMessage.success('已复制到剪贴板');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = () => {
    const newContent = prompt('编辑消息', message.content);
    newContent !== null && updateMessage(message.id, { content: newContent });
  };

  const handleDelete = () => {
    confirm('确定要删除这条消息吗？') && deleteMessage(message.id);
  };

  return (
    <motion.div
      className={`my-3 px-2 flex gap-3 ${!isAI ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className={`flex-shrink-0 flex items-start justify-center`}>
        <Avatar
          name={isAI ? 'HelloBoss' : user?.name || '用户'}
          size="small"
        />
      </div>

      <div className="relative flex-1">
        <div
          className={`
            relative p-4 rounded-2xl mx-1.5 max-w-[80%] overflow-x-auto break-words
            transition-all duration-200 ease-in-out
            ${isAI ? 'bg-[var(--color-quaternary)] text-[var(--color-text-dark)] mr-auto border border-[var(--color-border)]' : 'bg-[var(--color-secondary)] text-[var(--color-text-dark)] ml-auto'}
            ${isHovered ? 'shadow-md' : 'shadow-sm'}
          `}
        >
          <div className="prose max-w-none overflow-hidden">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // @ts-ignore
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const code = String(children).replace(/\n$/, '');
                  const codeId = `${message.id}-${code.substring(0, 10)}`;

                  if (!inline && match?.[1] === 'mermaid') {
                    return (
                      <div
                        ref={mermaidRef}
                        className="mermaid my-4 p-2 bg-[var(--color-background)] rounded border border-[var(--color-border)]"
                      >
                        {code}
                      </div>
                    );
                  }

                  if (!inline) {
                    return (
                      <div className="relative">
                        <Tooltip title={copiedId === codeId ? '已复制' : '复制代码'}>
                          <button
                            onClick={() => copyToClipboard(code, codeId)}
                            className="absolute right-2 top-2 p-1 rounded bg-gray-700 hover:bg-gray-600"
                            title="Copy to clipboard"
                          >
                            {copiedId === codeId ? <CheckOutlined /> : <CopyOutlined />}
                          </button>
                        </Tooltip>
                        <SyntaxHighlighter
                          // @ts-ignore
                          style={atomDark}
                          language={match?.[1]}
                          PreTag="div"
                          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-editor-background)]"
                          {...props}
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  return (
                    <code
                      className={`${className} bg-[var(--color-background)] px-1.5 py-0.5 rounded border border-[var(--color-border)]`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children, ...props }) => (
                  <blockquote
                    className="border-l-4 border-[var(--color-secondary)] pl-4 my-2 italic text-[var(--color-text-secondary)]"
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto">
                    <table
                      className="w-full border-collapse my-2"
                      {...props}
                    >
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children, ...props }) => (
                  <th
                    className="border border-[var(--color-border)] px-3 py-1.5 text-left bg-[var(--color-background)]"
                    {...props}
                  >
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td
                    className="border border-[var(--color-border)] px-3 py-1.5"
                    {...props}
                  >
                    {children}
                  </td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>

            {isPending && isAI && message.content.trim().length === 0 && (
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm mt-2">
                <Spin size="small" />
                <span>正在思考中...</span>
              </div>
            )}
          </div>

          <AnimatePresence>
            {!isPending && isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex justify-end space-x-2 mt-2"
              >
                <Tooltip title="编辑">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-transparent)]"
                  />
                </Tooltip>
                <Tooltip title="删除">
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-transparent)]"
                  />
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
