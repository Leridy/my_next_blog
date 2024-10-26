import axios, {AxiosResponse} from 'axios';

const requestHandler = (request: any) => {
  // add jwt token to request header
  const token = localStorage.getItem('token');
  request.headers['Authorization'] = `Bearer ${token}`;
  return request;
}

const responseHandler = (response: any): AxiosResponse["data"] => {
  // add response handler
  /**
   * if response status code starts with 2, return response.data
   * else throw an error with it's status code and message
   */
  if (response.status.toString().startsWith('2')) {
    return response.data;
  } else {
    throw new Error(response.data.message);
  }
}

// create an axios instance with handler above
const instance = axios.create({
  baseURL: '/api',
});

instance.interceptors.request.use(requestHandler);
instance.interceptors.response.use(responseHandler);

export default instance;


