import { NextRequest, NextResponse } from 'next/server';
import { APIErrorHandler, MyNRError } from '@/utils/MyNRError';
import axios from 'axios';

// 常量配置
const API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = process.env.DEEPSEEK_API_KEY || '';
const MODEL_NAME = 'deepseek-chat';
const TEMPERATURE = 0.7;
const MAX_DAILY_REQUESTS = 10;
const COOKIE_NAME = '_daily_requests';

// 创建流式响应的工具函数
function createStreamResponse(streamGenerator: (controller: ReadableStreamDefaultController) => Promise<void>, cookieValue: string): Response {
  const stream = new ReadableStream({
    start: streamGenerator,
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Set-Cookie': `${COOKIE_NAME}=${cookieValue}; HttpOnly; Path=/; Expires=${getEndOfDay().toUTCString()}`,
    },
  });
}

// 限额耗尽的流式响应处理器
async function limitExceededHandler(controller: ReadableStreamDefaultController): Promise<void> {
  const encoder = new TextEncoder();
  const limitMessage = {
    choices: [
      {
        delta: {
          role: 'assistant',
          content: '您今日的请求次数已达到限制（10次），请明天再试。',
        },
        finish_reason: 'stop',
      },
    ],
    usage: { total_tokens: 0 },
  };

  controller.enqueue(encoder.encode(`data: ${JSON.stringify(limitMessage)}\n\n`));
  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
  controller.close();
}

// API调用的流式响应处理器
async function apiStreamHandler(messages: unknown[], controller: ReadableStreamDefaultController): Promise<void> {
  const encoder = new TextEncoder();

  try {
    // 连接到模型API，开启流式响应
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: MODEL_NAME,
        messages,
        temperature: TEMPERATURE,
        stream: true, // 启用流式响应
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        responseType: 'stream',
      }
    );

    // 处理流式响应
    response.data.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      console.log('Received chunk:', text);
      if (text.trim() !== '') {
        controller.enqueue(encoder.encode(text));
      }
    });

    response.data.on('end', () => {
      controller.close();
    });

    response.data.on('error', (err: Error) => {
      controller.error(err);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('API error:', error.message);
      controller.enqueue(
        encoder.encode(
          JSON.stringify({
            error: 'Error from API',
            details: error.message,
          })
        )
      );
    }
    controller.close();
  }
}

// POST 处理函数
async function post(req: NextRequest) {
  // 获取当前请求次数
  const dailyRequests = getRequestCount(req);

  // 解析请求体
  const body = await req.json();
  const { messages } = body;

  if (!messages || !Array.isArray(messages)) {
    throw new MyNRError('Invalid messages format', 400);
  }

  // 检查是否超过限制并创建相应的流
  if (dailyRequests >= MAX_DAILY_REQUESTS) {
    return createStreamResponse(limitExceededHandler, String(dailyRequests));
  } else {
    return createStreamResponse((controller) => apiStreamHandler(messages, controller), String(dailyRequests + 1));
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
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

export const GET = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, () => get(req));

export const POST = (req: NextRequest, res: NextResponse) => APIErrorHandler(req, res, () => post(req));
