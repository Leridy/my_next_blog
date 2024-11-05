import axios, {AxiosError, AxiosResponse} from 'axios';

const responseHandler = (response: AxiosResponse): AxiosResponse["data"] => {
  // add response handler
  /**
   * if response status code starts with 2, return response.data
   * else throw an error with it's status code and message
   */
  if (response.status.toString().startsWith('2')) {
    return response.data;
  }

}

const errorHandler = (error: AxiosError) => {
  // add error handler
  throw error;
}

// create an axios instance with handler above
const instance = axios.create({});

instance.interceptors.request.use();
instance.interceptors.response.use(responseHandler, errorHandler);

export default instance;
