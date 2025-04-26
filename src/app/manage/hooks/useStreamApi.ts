// hooks/useStreamApi.ts
import { useState, useCallback } from 'react';

interface StreamApiOptions {
  apiURL: string;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

interface UseStreamApiReturn<T> {
  isStreaming: boolean;
  streamError: Error | null;
  streamFetch: (data: T) => Promise<void>;
  abortStream: () => void;
}

export interface OpenAIStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    delta: {
      content?: string;
      role?: string;
    };
    index: number;
    finish_reason: string | null;
  }[];
}

/**
 * 将 SSE 数据流解析为 JavaScript 对象
 * @param text SSE 数据文本
 * @returns 解析出的对象数组
 */
export function parseSSEData(text: string): OpenAIStreamResponse[] {
  const results: OpenAIStreamResponse[] = [];

  // 按行分割
  const lines = text.split('data:').filter((item) => !item.includes('[DONE]\n') && Boolean(item));

  // 处理每一行
  for (const line of lines) {
    // 去除首尾空白, 取出句前面的 keep-alive
    const trimmedLine = line.trim().replace('^keep-alive', '');

    // 跳过空行
    if (!trimmedLine) continue;

    // 检查是否以 data: 开头
    if (trimmedLine) {
      try {
        const data = JSON.parse(trimmedLine);
        results.push(data);
        // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (error) {
        // 静默处理解析错误或记录
        console.error(error, 'JSON 解析错误:', trimmedLine);
      }
    } else if (trimmedLine.startsWith('[DONE]')) {
      // 遇到 [DONE] 结束符，停止解析
    }
  }

  return results;
}

export default function useStreamApi<T>({ apiURL, onChunk, onComplete, onError }: StreamApiOptions): UseStreamApiReturn<T> {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<Error | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const abortStream = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  }, [abortController]);

  const streamFetch = useCallback(
    async (data: T) => {
      setIsStreaming(true);
      setStreamError(null);

      // 创建新的AbortController
      const controller = new AbortController();
      setAbortController(controller);

      const fullUrl = apiURL.startsWith('https://') || apiURL.startsWith('http://') ? apiURL : `${window.location.origin}/api/${apiURL}`;

      let fullResponse = '';

      try {
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          signal: controller.signal,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('ReadableStream not supported in this browser.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          // 解码数据块
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;

          // 调用回调函数
          if (onChunk) {
            onChunk(chunk);
          }
        }

        if (onComplete) {
          onComplete(fullResponse);
        }
      } catch (error) {
        // 避免处理已中止的请求错误
        // @ts-ignore
        if (error.name !== 'AbortError') {
          console.error('Stream API error:', error);
          setStreamError(error as Error);
          if (onError) {
            onError(error as Error);
          }
        }
      } finally {
        setIsStreaming(false);
        setAbortController(null);
      }
    },
    [apiURL, onChunk, onComplete, onError]
  );

  return { isStreaming, streamError, streamFetch, abortStream };
}
