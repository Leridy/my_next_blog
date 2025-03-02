import md5 from 'md5';
import http from '@/server/Spider/http';

export const getToken = async () => {
  const result = await http.get('https://api-media.51cto.com/api/token-get', {
    headers: {
      'return-raw': true,
    },
  });
  return result.data.data.data.token;
};

export const sign = (
  requestPath: string,
  payload: Record<string, unknown> = {},
  timestamp: number,
  token: string
) => {
  payload.timestamp = timestamp;
  payload.token = token;
  const sortedParams = Object.keys(payload).sort();
  return md5(md5(requestPath) + md5(sortedParams + md5(token) + timestamp));
};
