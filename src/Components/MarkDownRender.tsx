// @ts-nocheck
// eslint-disable-next-line
// eslint-disable
// prettier-ignore

// components/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import { Divider, Tooltip } from 'antd';
import { useTheme } from 'next-themes';
import { FiLink, FiCheckSquare, FiSquare, FiList, FiCode, FiImage } from 'react-icons/fi';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // 自定义渲染组件
  const components = {
    // 标题渲染
    // eslint-disable-next-line unused-imports/no-unused-vars
    h1: ({ node, children, ...props }: any) => (
      <h1
        className="text-3xl font-bold mt-6 mb-4 pb-2 border-b border-[var(--color-border)] text-[var(--color-text)]"
        {...props}
      >
        {children}
      </h1>
    ),
    // eslint-disable-next-line unused-imports/no-unused-vars
    h2: ({ node, children, ...props }: any) => (
      <h2
        className="text-2xl font-semibold mt-5 mb-3 text-[var(--color-text)]"
        {...props}
      >
        {children}
      </h2>
    ),
    // eslint-disable-next-line unused-imports/no-unused-vars
    h3: ({ node, children, ...props }: any) => (
      <h3
        className="text-xl font-medium mt-4 mb-2 text-[var(--color-text)]"
        {...props}
      >
        {children}
      </h3>
    ),
    // eslint-disable-next-line unused-imports/no-unused-vars
    h4: ({ node, children, ...props }: any) => (
      <h4
        className="text-lg font-medium mt-3 mb-2 text-[var(--color-text)]"
        {...props}
      >
        {children}
      </h4>
    ),

    // 段落渲染
    // eslint-disable-next-line unused-imports/no-unused-vars
    p: ({ node, children, ...props }: any) => (
      <p
        className="my-3 leading-relaxed text-[var(--color-text)]"
        {...props}
      >
        {children}
      </p>
    ),

    // 链接渲染
    // eslint-disable-next-line unused-imports/no-unused-vars
    a: ({ node, children, href, ...props }: any) => (
      <Tooltip title={href}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-text)] hover:text-[var(--color-text)] hover:bg-[var(--color-secondary)] underline decoration-dashed underline-offset-4 inline-flex items-center gap-1 transition-colors duration-200"
          {...props}
        >
          {children}
          <FiLink className="text-xs inline" />
        </a>
      </Tooltip>
    ),

    // 列表渲染
    // eslint-disable-next-line unused-imports/no-unused-vars
    ul: ({ node, children, ...props }: any) => (
      <ul
        className="pl-1 my-3 list-none text-[var(--color-text)]"
        {...props}
      >
        {children}
      </ul>
    ),
    // eslint-disable-next-line unused-imports/no-unused-vars
    ol: ({ node, children, ...props }: any) => (
      <ol
        className="pl-1 my-3 list-decimal text-[var(--color-text)]"
        {...props}
      >
        {children}
      </ol>
    ),
    // eslint-disable-next-line unused-imports/no-unused-vars
    li: ({ node, children, ordered, ...props }: any) => (
      <li
        className="my-1 flex items-start gap-2"
        {...props}
      >
        {!ordered && <FiList className="mt-1.5 text-[var(--color-tertiary)]" />}
        <span>{children}</span>
      </li>
    ),

    // 引用块渲染
    // eslint-disable-next-line unused-imports/no-unused-vars
    blockquote: ({ node, children, ...props }: any) => (
      <blockquote
        className="pl-4 border-l-4 border-[var(--color-primary)] bg-[var(--color-card-background)] rounded-r my-4 py-2 pr-3 italic text-[var(--color-text)]"
        {...props}
      >
        {children}
      </blockquote>
    ),

    // 代码块渲染
    // eslint-disable-next-line unused-imports/no-unused-vars
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');

      return !inline && match ? (
        <div className="my-4 rounded-lg overflow-hidden shadow-sm">
          <div className="px-4 py-1.5 bg-[var(--color-tertiary)] flex items-center">
            <FiCode className="text-[var(--color-text-light)] mr-2" />
            <span className="text-sm text-[var(--color-text-light)] font-mono uppercase">{match[1]}</span>
          </div>
          <SyntaxHighlighter
            style={isDarkMode ? vscDarkPlus : vs}
            language={match[1]}
            PreTag="div"
            className="!m-0 !rounded-t-none"
            customStyle={{ margin: 0, borderRadius: '0 0 0.5rem 0.5rem' }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code
          className="px-1.5 py-0.5 mx-1 bg-[var(--color-quaternary)] text-[var(--color-text)] rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },

    // 图片渲染
    // eslint-disable-next-line unused-imports/no-unused-vars
    img: ({ node, src, alt, ...props }: any) => (
      <div className="my-4 flex flex-col items-center">
        <div className="relative overflow-hidden rounded-lg shadow-md border border-[var(--color-border)] bg-[var(--color-quaternary)] p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || ''}
            className="max-w-full h-auto rounded object-cover"
            loading="lazy"
            {...props}
          />
        </div>
        {alt && (
          <p className="text-sm text-center mt-2 text-[var(--color-text-secondary)] italic">
            <FiImage className="inline mr-1" />
            {alt}
          </p>
        )}
      </div>
    ),

    // 表格渲染
    // eslint-disable-next-line unused-imports/no-unused-vars
    table: ({ node, children, ...props }: any) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-[var(--color-border)] shadow-sm">
        <table
          className="min-w-full divide-y divide-[var(--color-border)]"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    // eslint-disable-next-line unused-imports/no-unused-vars
    thead: ({ node, children, ...props }: any) => (
      <thead
        className="bg-[var(--color-quaternary)]"
        {...props}
      >
        {children}
      </thead>
    ),
    // eslint-disable-next-line unused-imports/no-unused-vars
    tbody: ({ node, children, ...props }: any) => (
      <tbody
        className="divide-y divide-[var(--color-border)] bg-[var(--color-transparent-background)]"
        {...props}
      >
        {children}
      </tbody>
    ),
    // eslint-disable-next-line unused-imports/no-unused-vars
    tr: ({ node, children, ...props }: any) => (
      <tr
        className="transition-colors duration-100 hover:bg-[var(--color-quaternary)]"
        {...props}
      >
        {children}
      </tr>
    ),
    // eslint-disable-next-line unused-imports/no-unused-vars
    th: ({ node, children, ...props }: any) => (
      <th
        className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text)]"
        {...props}
      >
        {children}
      </th>
    ),
    // eslint-disable-next-line unused-imports/no-unused-vars
    td: ({ node, children, ...props }: any) => (
      <td
        className="px-4 py-2 text-sm text-[var(--color-text)]"
        {...props}
      >
        {children}
      </td>
    ),

    // 分隔线
    hr: () => <Divider className="my-6 border-[var(--color-border)]" />,

    // 强调
    // eslint-disable-next-line unused-imports/no-unused-vars
    em: ({ node, children, ...props }: any) => (
      <em
        className="italic text-[var(--color-text)]"
        {...props}
      >
        {children}
      </em>
    ),

    // 加粗
    // eslint-disable-next-line unused-imports/no-unused-vars
    strong: ({ node, children, ...props }: any) => (
      <strong
        className="font-bold text-[var(--color-text)]"
        {...props}
      >
        {children}
      </strong>
    ),

    // 删除线
    // eslint-disable-next-line unused-imports/no-unused-vars
    del: ({ node, children, ...props }: any) => (
      <del
        className="line-through text-[var(--color-text-secondary)]"
        {...props}
      >
        {children}
      </del>
    ),

    // 复选框
    // eslint-disable-next-line unused-imports/no-unused-vars
    input: ({ node, checked, ...props }: any) => {
      const CheckboxIcon = checked ? FiCheckSquare : FiSquare;
      return (
        <span className="inline-block align-text-bottom mr-1">
          <CheckboxIcon className={`${checked ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'}`} />
        </span>
      );
    },
  };

  return (
    <ReactMarkdown
      components={components}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
