import axios, {AxiosError, AxiosResponse, InternalAxiosRequestConfig} from 'axios';

const requestHandler = (request: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  // 在 headers 里面添加 user-agent the request possibly undefined
  request.headers = request.headers || {};
  request.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';
  // make spider http more like a browser
  request.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
  request.headers['Accept-Encoding'] = 'gzip, deflate, sdch';
  request.headers['Accept-Language'] = 'zh-CN,zh;q=0.8,en;q=0.6';

  return request;
}

const responseHandler = (response: AxiosResponse): AxiosResponse["data"] => {
  // add response handler
  /**
   * if response status code starts with 2, return response.data
   * else throw an error with it's status code and message
   */
  if (response.status.toString().startsWith('2') && !response.config.headers['return-raw']) {
    return response.data;
  } else if (response.status.toString().startsWith('2') && response.config.headers['return-raw']) {
    return response;
  }

}

const errorHandler = (error: AxiosError) => {
  // add error handler
  throw error;
}

// create an axios instance with handler above
const instance = axios.create({});

instance.interceptors.request.use(requestHandler);
instance.interceptors.response.use(responseHandler, errorHandler);

export default instance;
