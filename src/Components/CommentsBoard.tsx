import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Spin, message, Divider, Modal, AutoComplete } from 'antd';
import { SendOutlined, MailOutlined, UserOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { filter } from 'sensitive-words-js';

// 检查敏感词
const checkSensitiveWords = (str: string) => {
  const { text, words } = filter.filter(str, { replace: true });

  message.error(`评论中包含敏感词：${words.join(', ')}`);
  return text;
};

// 处理字符串，防止 XSS 攻击，数据库注入等
const escapeString = (str: string) => {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const sanitizeString = (str: string) => {
  return checkSensitiveWords(escapeString(str));
};

// 删除Tailwind颜色配置
// 类型定义
type Message = {
  id: string;
  name: string;
  email?: string;
  content: string;
  timestamp: string;
  avatar?: string;
  isLocal?: boolean;
};

// 常量定义
const STORAGE_KEY = 'user_comments';
const LAST_NAME_KEY = 'last_user_name';
const LAST_EMAIL_KEY = 'last_user_email';
const LAST_COMMENT_DATE = 'last_comment_date';
const FORM_ENDPOINT = 'https://formspree.io/f/mnnjezjr'; // 你的Formspree ID

const CommentSystem: React.FC = () => {
  const [form] = Form.useForm();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [canComment, setCanComment] = useState(true);
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [remainingHours, setRemainingHours] = useState(0);

  // 生成随机验证码
  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  // 检查是否可以评论
  const checkCommentPermission = () => {
    const lastCommentDate = localStorage.getItem(LAST_COMMENT_DATE);

    if (lastCommentDate) {
      const lastDate = new Date(lastCommentDate);
      const now = new Date();
      const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

      if (diffHours < 24) {
        setCanComment(false);
        setRemainingHours(Math.ceil(24 - diffHours));
      } else {
        setCanComment(true);
      }
    } else {
      setCanComment(true);
    }
  };

  // 初始化
  useEffect(() => {
    // 加载初始数据和本地存储的评论
    const mockMessages: Message[] = [];

    // 从本地存储加载用户的评论
    const localComments = localStorage.getItem(STORAGE_KEY);
    const localMessages: Message[] = localComments ? JSON.parse(localComments) : [];

    setMessages([...localMessages, ...mockMessages]);

    // 恢复上次使用的昵称和邮箱
    const savedName = localStorage.getItem(LAST_NAME_KEY);
    const savedEmail = localStorage.getItem(LAST_EMAIL_KEY);

    if (savedName) {
      form.setFieldsValue({ name: savedName });
    }
    if (savedEmail) {
      form.setFieldsValue({ email: savedEmail });
    }

    // 检查评论权限
    checkCommentPermission();

    // 生成验证码
    generateCaptcha();
  }, [form]);

  // 提交表单
  const handleSubmit = async (values: { name: string; email: string; content: string; knownFrom: string; captcha: string; pageUrl: string; userAgent: string }) => {
    if (!canComment) {
      message.error(`评论太频繁，请等待 ${remainingHours} 小时后再试`);
      return;
    }

    if (userCaptcha !== captchaCode) {
      message.error('验证码错误');
      generateCaptcha();
      setUserCaptcha('');
      return;
    }

    setLoading(true);

    // 生成头像
    const nameSeed = values.name.toLowerCase().replace(/\s+/g, '-');

    // 对所有输入的内容做安全处理 和 敏感词检查，敏感词会被替换为 *，并通过 message.error 提示用户
    values.name = sanitizeString(values.name);
    // 防止 email 的 XSS 攻击
    values.email = escapeString(values.email);
    values.content = sanitizeString(values.content);
    values.knownFrom = sanitizeString(values.knownFrom);

    const newMessage: Message = {
      id: uuidv4(),
      name: values.name,
      email: values.email || undefined,
      content: values.content,
      timestamp: new Date().toISOString(),
      avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${nameSeed}`,
      isLocal: true,
    };

    try {
      // 发送到Formspree
      await axios.post(FORM_ENDPOINT, {
        name: values.name,
        email: values.email || 'No email provided',
        message: values.content,
        pageUrl: values.pageUrl,
        userAgent: values.userAgent,
        knownFrom: values.knownFrom,
        timestamp: new Date().toISOString(),
      });

      // 更新本地状态
      const updatedMessages = [newMessage, ...messages];
      setMessages(updatedMessages);

      // 保存到localStorage
      const localMessages = updatedMessages.filter((msg) => msg.isLocal);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localMessages));
      localStorage.setItem(LAST_NAME_KEY, values.name);
      if (values.email) localStorage.setItem(LAST_EMAIL_KEY, values.email);

      // 记录评论时间
      localStorage.setItem(LAST_COMMENT_DATE, new Date().toISOString());

      // 重置评论权限
      setCanComment(false);
      setRemainingHours(24);

      message.success('留言成功！');
      form.resetFields(['content', 'captcha']);
      setUserCaptcha('');
      generateCaptcha();
    } catch (error) {
      console.error('提交留言失败', error);
      message.error('提交失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 刷新验证码
  const refreshCaptcha = () => {
    generateCaptcha();
    setUserCaptcha('');
  };

  // 显示剩余时间弹窗
  const showTimeModal = () => {
    Modal.info({
      title: '评论限制',
      content: `根据设置，每位用户24小时内只能发表一条评论。您需要等待 ${remainingHours} 小时后才能再次评论。`,
      okText: '知道了',
    });
  };

  return (
    <div className={`w-full bg-[var(--color-card-background)] text-[var(--color-text)] rounded-lg px-4 py-5 h-[780px]`}>
      <div className="mb-5">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="昵称"
              rules={[{ required: true, message: '请输入您的昵称' }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="您的昵称"
                maxLength={20}
                className="bg-[var(--color-editor-background)] border-[var(--color-border)]"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱 (选填)"
              rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
            >
              <Input
                prefix={<MailOutlined className="site-form-item-icon" />}
                placeholder="您的邮箱，非必填"
                className="bg-[var(--color-editor-background)] border-[var(--color-border)]"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="content"
            label="留言内容"
            rules={[{ required: true, message: '请输入留言内容' }]}
          >
            <Input.TextArea
              placeholder="写下您的留言..."
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={500}
              showCount
              className="bg-[var(--color-editor-background)] border-[var(--color-border)]"
            />
          </Form.Item>

          <Form.Item
            name="knownFrom"
            label="您是如何发现这个网站的？(选填)"
          >
            <AutoComplete
              placeholder="例如：搜索引擎、朋友推荐等"
              className="bg-[var(--color-editor-background)] border-[var(--color-border)]"
              options={[{ value: '搜索引擎' }, { value: '朋友推荐' }, { value: '社交媒体' }, { value: '偶然发现' }]}
            />
          </Form.Item>

          <div className="flex items-center mb-4">
            <Form.Item
              name="captcha"
              label="验证码"
              rules={[{ required: true, message: '请输入验证码' }]}
              className="mb-0 flex-1 mr-2"
            >
              <Input
                prefix={<SafetyCertificateOutlined />}
                placeholder="请输入验证码"
                value={userCaptcha}
                onChange={(e) => setUserCaptcha(e.target.value)}
                maxLength={6}
                className="bg-[var(--color-editor-background)] border-[var(--color-border)]"
              />
            </Form.Item>

            <div className="flex items-end h-full">
              <div
                className="h-10 px-3 flex items-center justify-center font-mono text-lg select-none cursor-pointer bg-[var(--color-primary-transparent)] text-[var(--color-text)] rounded"
                onClick={refreshCaptcha}
              >
                {captchaCode}
              </div>
            </div>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={loading}
              disabled={!canComment}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-transparent)] border-none"
              onClick={!canComment ? showTimeModal : undefined}
            >
              {canComment ? '提交留言' : `请等待 ${remainingHours} 小时后再次留言`}
            </Button>
          </Form.Item>

          <input
            type="hidden"
            name="pageUrl"
            value={typeof window !== 'undefined' ? window.location.href : ''}
          />
          <input
            type="hidden"
            name="userAgent"
            value={typeof window !== 'undefined' ? window.navigator.userAgent : ''}
          />
        </Form>
      </div>

      <Divider className="border-[var(--color-border)]">留言列表</Divider>

      <div
        className="overflow-y-auto"
        style={{ maxHeight: '400px' }}
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-[var(--color-text-secondary)]">暂无留言，来添加第一条吧！</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 p-4 rounded-lg bg-[var(--color-card-background)] border border-[var(--color-border)]`}
            >
              <div className="flex items-start">
                <div className="mr-3">
                  {msg.avatar ? (
                    <img
                      src={msg.avatar}
                      alt={msg.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary-transparent)] flex items-center justify-center text-[var(--color-text)]">{msg.name.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">{msg.name}</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">{format(new Date(msg.timestamp), 'yyyy-MM-dd HH:mm')}</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSystem;
