'use client';
import React, { FC, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import mermaid from 'mermaid';
import { Message } from '@/IndexedDB/HelloBoss/types';
import { HelloBossContextType } from '@/Provider/HelloBossProvider/HelloBossProvider';
import { useUserContext } from '@/Provider/UserProvider';
import Avatar from '@/Components/NavBar/Avatar';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
  },
});

interface MessageBubbleProps {
  message: Message;
  isPending?: boolean;
  updateMessage: HelloBossContextType['updateMessage'];
  deleteMessage: HelloBossContextType['deleteMessage'];
}

const MessageBubble: FC<MessageBubbleProps> = (props) => {
  const { user } = useUserContext();
  const { message, isPending, updateMessage, deleteMessage } = props;
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

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
  const bubbleClasses = `
    relative p-4 rounded-lg mx-1.5
    ${!isAI ? 'bg-[var(--color-primary)] text-[var(--color-text-dark)] ml-auto' : 'bg-[var(--color-quaternary)] text-[var(--color-text-dark)] mr-auto'}
    max-w-[80%]
    overflow-x-auto
    break-words
    shadow-sm
    group
  `;

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      className={`my-3 px-2 flex gap-3 ${!isAI ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex-shrink-0 flex items-start justify-center text-white`}>
        <Avatar
          name={isAI ? 'HelloBoss' : user?.name || '用户'}
          size="small"
        />
      </div>

      <div className="relative flex-1">
        <div className={bubbleClasses}>
          <div className="prose max-w-none dark:prose-invert overflow-hidden">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // @ts-ignore
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const code = String(children).replace(/\n$/, '');

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
                        <button
                          onClick={() => copyToClipboard(code)}
                          className="absolute right-2 top-2 p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Copy to clipboard"
                        >
                          {copied === code ? <CheckIcon className="h-4 w-4 text-green-400" /> : <ClipboardDocumentIcon className="h-4 w-4 text-gray-300" />}
                        </button>
                        <SyntaxHighlighter
                          // @ts-ignore
                          style={atomDark}
                          language={match?.[1]}
                          PreTag="div"
                          {...props}
                          className="rounded-md"
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  return (
                    <code
                      className={`${className} bg-[var(--color-background)] px-1 py-0.5 rounded border border-[var(--color-border)]`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre({ children, ...props }) {
                  // @ts-ignore
                  return <div {...props}>{children}</div>;
                },
                blockquote({ children, ...props }) {
                  return (
                    <blockquote
                      className="border-l-4 border-[var(--color-secondary)] pl-4 my-2 italic text-[var(--color-text-secondary)]"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  );
                },
                table({ children, ...props }) {
                  return (
                    <div className="overflow-x-auto">
                      <table
                        className="w-full border-collapse my-2"
                        {...props}
                      >
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children, ...props }) {
                  return (
                    <th
                      className="border border-[var(--color-border)] px-3 py-1.5 text-left bg-[var(--color-background)]"
                      {...props}
                    >
                      {children}
                    </th>
                  );
                },
                td({ children, ...props }) {
                  return (
                    <td
                      className="border border-[var(--color-border)] px-3 py-1.5"
                      {...props}
                    >
                      {children}
                    </td>
                  );
                },
                ul({ children, ...props }) {
                  return (
                    <ul
                      className="list-disc pl-6 my-2"
                      {...props}
                    >
                      {children}
                    </ul>
                  );
                },
                ol({ children, ...props }) {
                  return (
                    <ol
                      className="list-decimal pl-6 my-2"
                      {...props}
                    >
                      {children}
                    </ol>
                  );
                },
                li({ children, ...props }) {
                  return (
                    <li
                      className="my-1"
                      {...props}
                    >
                      {children}
                    </li>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          <AnimatePresence>
            {!isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-end space-x-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  onClick={() => {
                    const newContent = prompt('编辑消息', message.content);
                    if (newContent !== null) {
                      updateMessage(message.id, { content: newContent });
                    }
                  }}
                  className="text-xs px-2 py-1 rounded transition-colors
                    text-[var(--color-text-secondary)] hover:text-[var(--color-text-dark)]
                    hover:bg-[var(--color-background)]"
                >
                  编辑
                </button>
                <button
                  onClick={() => {
                    if (confirm('确定要删除这条消息吗？')) {
                      deleteMessage(message.id);
                    }
                  }}
                  className="text-xs px-2 py-1 rounded transition-colors
                    text-[var(--color-text-secondary)] hover:text-[var(--color-text-dark)]
                    hover:bg-[var(--color-background)]"
                >
                  删除
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
