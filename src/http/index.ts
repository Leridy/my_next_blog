import axios, {AxiosError, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {notification} from "antd";

const requestHandler = (request: InternalAxiosRequestConfig) => {
  // add jwt token to request header
  const token = localStorage.getItem('token');
  if (token) {
    request.headers['Authorization'] = `${token}`;
  }
  return request;
}

const responseHandler = (response: AxiosResponse): AxiosResponse["data"] => {
  // add response handler
  /**
   * if response status code starts with 2, return response.
   * Data
   * else throws an error with its status code and message.
   */
  if (response.status.toString().startsWith('2')) {
    return response.data;
  }

}

const errorHandler = (error: AxiosError) => {
  // add error handler
  throw axiosErrorToNetworkError(error);
}

// create an axios instance with handler above
const instance = axios.create({
  baseURL: '/api',
});

instance.interceptors.request.use(requestHandler);
instance.interceptors.response.use(responseHandler, errorHandler);

export default instance;


/**
 * 定义一个自己的 网络错误 error 类
 * @param message // 网络错误信息
 * @param status // 网络错误状态码
 * @param bizMessage // 业务错误信息
 * @param extraData // 网络错误返回的数据
 * @param originError // 原始错误
 */
export class NetworkError extends Error {
  status: number;
  bizMessage: string;
  extraData: unknown;
  originError: AxiosError | undefined;

  constructor(message: string, status: number, bizMessage: string, extraData: unknown, originError?: AxiosError) {
    super(message);
    this.status = status;
    this.bizMessage = bizMessage;
    this.extraData = extraData;
    this.originError = originError;
  }
}

export function axiosErrorToNetworkError(error: AxiosError) {
  // convert error to network error
  const status = error.response?.status || 500;
  const bizMessage = error.message;
  // @ts-expect-error error response may not exist
  const message = error.response?.data?.message;
  const extraData = error.response?.data;

  const newError = new NetworkError(message, status, bizMessage, extraData, error);

  if (error.config?.headers?.['x-ignore-error']) throw newError;

  switch (status) {
    case 401:
      notification.error({
        message: '未登录',
        description: newError.bizMessage || newError.message || '请先登录',
      });
      break;
    case 403:
      notification.error({
        message: '权限不足',
        description: newError.bizMessage || newError.message || '您没有权限访问该资源',
      });
      break;
    case 404:
      notification.error({
        message: '资源不存在',
        description: newError.bizMessage || newError.message || '您访问的资源不存在',
      });
      break;
    case 500:
      notification.error({
        message: '服务器错误',
        description: newError.bizMessage || newError.message || '服务器错误，请稍后再试',
      });
      break;
    default:
      notification.error({
        message: `未知错误, 错误码 ${status} `,
        description: newError.bizMessage || newError.message || '未知错误',
      });
      break;
  }
  throw newError;
}





