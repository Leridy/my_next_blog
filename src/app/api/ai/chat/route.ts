import { NextRequest, NextResponse } from 'next/server';
import { APIErrorHandler } from '@/utils/MyNRError';
import { MyNRError } from '@/utils/MyNRError';
import axios from 'axios';

// 常量配置
const API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'; // 替换为实际的  API 端点
const API_KEY = process.env.DEEPSEEK_API_KEY || ''; // 从环境变量获取
const MODEL_NAME = 'deepseek-chat'; // 替换为实际使用的模型名称
const TEMPERATURE = 0.7;
const MAX_DAILY_REQUESTS = 10;
const COOKIE_NAME = '_daily_requests';

// POST 处理函数
async function post(req: NextRequest) {
  // 获取当前请求次数
  const dailyRequests = getRequestCount(req);

  // 检查是否超过限制
  if (dailyRequests >= MAX_DAILY_REQUESTS) {
    return NextResponse.json(
      {
        choices: [
          {
            message: {
              role: 'assistant',
              content: '您今日的请求次数已达到限制（10次），请明天再试。',
            },
            finish_reason: 'stop',
          },
        ],
        usage: { total_tokens: 0 },
      },
      { status: 200 }
    );
  }

  // 解析请求体
  const body = await req.json();
  const { messages } = body;

  if (!messages || !Array.isArray(messages)) {
    throw new MyNRError('Invalid messages format', 400);
  }

  console.log('API_KEY:', API_KEY);

  try {
    // 转发请求到  API
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: MODEL_NAME,
        messages,
        temperature: TEMPERATURE,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    // 更新请求次数 cookie
    const nextResponse = NextResponse.json(response.data, { status: 200 });
    nextResponse.cookies.set({
      name: COOKIE_NAME,
      value: String(dailyRequests + 1),
      httpOnly: true,
      expires: getEndOfDay(),
      path: '/',
    });

    return nextResponse;
  } catch (error: any) {
    console.error(' API error:', error.response?.data || error.message);
    throw new MyNRError('Error from  API', 502, error.response?.data || error.message);
  }
}

// GET 处理函数，用于连通性测试
async function get(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const message = searchParams.get('message');

  if (message === 'hi') {
    return NextResponse.json({ message: 'ok' }, { status: 200 });
  }

  throw new MyNRError('Not Found', 404);
}

// 获取当前请求次数
function getRequestCount(req: NextRequest): number {
  const count = req.cookies.get(COOKIE_NAME)?.value;
  return count ? parseInt(count, 10) : 0;
}

// 获取当天结束时间，用于设置 cookie 过期时间
function getEndOfDay(): Date {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return endOfDay;
}

export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, () => get(req));

export const POST = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, () => post(req));
