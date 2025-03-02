import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Spin,
  message,
  Divider,
  Modal,
  AutoComplete,
} from 'antd';
import {
  SendOutlined,
  MailOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { format } from 'date-fns';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { filter } from 'sensitive-words-js';

// 检查敏感词
const checkSensitiveWords = (str: string) => {
  const { text, words } = filter.filter(str, {
    replace: true,
  });

  message.error(`评论中包含敏感词：${words.join(', ')}`);
  return text;
};

// 处理字符串，防止 XSS 攻击，数据库注入等
const sanitizeString = (str: string) => {
  return checkSensitiveWords(str.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
};

// Tailwind颜色配置
const tailwindColors = {
  bg: 'bg-[rgba(223,242,235,0.95)] dark:bg-[rgba(26,54,54,0.95)]',
  primary: 'bg-[rgba(185,229,232,0.9)] dark:bg-[rgba(103,125,106,0.85)]',
  text: 'text-[rgba(40,44,52,0.9)] dark:text-[rgba(226,226,226,0.9)]',
  border: 'border-[rgba(204,204,204,0.6)] dark:border-[rgba(204,204,204,0.4)]',
  card: 'bg-[rgba(203,220,235,0.75)] dark:bg-[rgba(98,149,132,0.3)]',
};

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
    const chars =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
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
    const localMessages: Message[] = localComments
      ? JSON.parse(localComments)
      : [];

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
  const handleSubmit = async (values: {
    name: string;
    email: string;
    content: string;
    knownFrom: string;
    captcha: string;
    pageUrl: string;
    userAgent: string;
  }) => {
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
    values.email = sanitizeString(values.email);
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
    <div
      className={`w-full ${tailwindColors.bg} ${tailwindColors.text} rounded-lg px-4 py-5 h-[780px]`}
    >
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
              />
            </Form.Item>
          </div>

          <Form.Item
            name="content"
            label="留言内容"
            rules={[{ required: true, message: '请输入留言内容' }]}
          >
            <Input.TextArea
              placeholder="请输入您的留言内容..."
              maxLength={200}
              showCount
              rows={4}
              disabled={!canComment}
              onClick={!canComment ? showTimeModal : undefined}
            />
          </Form.Item>

          <Form.Item name="knownFrom" label="您从何处知道这个网站">
            <AutoComplete
              options={[
                { value: 'Google' },
                { value: 'Bing' },
                { value: '百度' },
                { value: '其他搜索引擎' },
                { value: '朋友推荐' },
                { value: '社交媒体' },
                { value: '其他' },
              ]}
            >
              <Input placeholder="请选择或输入" />
            </AutoComplete>
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <Form.Item
              name="captcha"
              label="验证码"
              rules={[{ required: true, message: '请输入验证码' }]}
              className={'w-full'}
            >
              <div className="flex items-center space-x-2 w-full">
                <Input
                  prefix={
                    <SafetyCertificateOutlined className="site-form-item-icon" />
                  }
                  placeholder="输入验证码"
                  value={userCaptcha}
                  onChange={(e) => setUserCaptcha(e.target.value)}
                  maxLength={6}
                  disabled={!canComment}
                />
                <div
                  className="w-[120px] h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 font-mono text-lg cursor-pointer select-none"
                  onClick={refreshCaptcha}
                >
                  {captchaCode}
                </div>
              </div>
            </Form.Item>

            <Form.Item name="pageUrl" hidden>
              <Input value={window.location.href} />
            </Form.Item>

            <Form.Item name="userAgent" hidden>
              <Input value={navigator.userAgent} />
            </Form.Item>
          </div>

          {!canComment && (
            <div
              className="mr-4 text-yellow-600 dark:text-yellow-400 text-sm cursor-pointer"
              onClick={showTimeModal}
            >
              等待 {remainingHours}h
            </div>
          )}
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={loading}
            disabled={!canComment}
            style={{
              backgroundColor: 'rgba(40,167,69,0.9)',
              borderColor: 'rgba(40,167,69,0.9)',
            }}
            block
          >
            提交留言
          </Button>
        </Form>
      </div>

      <div className="text-xs opacity-60 mb-4">
        <MailOutlined className="mr-1" />
        留言功能由
        <a
          href="https://formspree.io/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Formspree
        </a>
        提供，您的留言将不会被公开
      </div>

      <Divider className="my-4" orientation="left">
        你的全部留言
      </Divider>

      <div className="space-y-4 max-h-[220px] overflow-y-auto">
        {loading && (
          <div className="py-4 flex justify-center">
            <Spin tip="提交中..." />
          </div>
        )}

        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg border ${tailwindColors.border} ${tailwindColors.card} ${message.isLocal ? 'border-l-4 border-l-[rgba(40,167,69,0.9)]' : ''}`}
            >
              <div className="flex items-start">
                <img
                  src={message.avatar}
                  alt={message.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center flex-wrap">
                    <span className="font-medium mr-2">{message.name}</span>
                    {message.isLocal && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                        你
                      </span>
                    )}
                    <span className="text-xs opacity-60 ml-auto">
                      {format(new Date(message.timestamp), 'yyyy-MM-dd HH:mm')}
                    </span>
                  </div>
                  <div className="mt-2 text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 opacity-60">
            暂无留言，成为第一个留言的人吧！
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSystem;
