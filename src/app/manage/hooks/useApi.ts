import http from '@/http';
import {useCallback, useState} from "react";

export type UseApiProps = {
  apiURL: string;
  // 例外情况
  exception?: {
    type: 'user'
  }
}

export type UseApiReturn<T> = {
  items: T[];
  loading: boolean;
  data: T | null;
  get: (params?: Partial<T>) => Promise<T[]>;
  getOne: (id: string) => Promise<T>;
  create: (data: Partial<T>) => Promise<T>;
  edit: (id: string, data: Partial<T>) => Promise<T>;
  del: (id: string) => Promise<void>;
  clearData: () => void;
}

export default function useApi<T>(props: UseApiProps): UseApiReturn<T> {
  const {apiURL, exception} = props;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<T | null>(null);

  const get = useCallback(async (params?: Partial<T>) => {
    let finalURL = apiURL;

    if (exception?.type === 'user') finalURL = apiURL + '/all'; // 任何时候都会有个例外情况

    try {
      setLoading(true);
      const res = await http.get(finalURL, {params}) as T[];
      setItems(res);
      return res;
    } finally {
      setLoading(false);
    }
  }, [apiURL]);

  const getOne = useCallback(async (id: string): Promise<T> => {
    try {
      setLoading(true);
      const res = await http.get(`${apiURL}/${id}`) as T;
      setData(res);
      return res;
    } finally {
      setLoading(false);
    }
  }, [apiURL]);

  const create = async (data: Partial<T>) => {
    try {
      setLoading(true);
      return await http.post(apiURL, data) as T;
    } finally {
      setLoading(false);
    }
  };

  const edit = useCallback(async (id: string, data: Partial<T>): Promise<T> => {
    try {
      setLoading(true);
      return await http.put(`${apiURL}/${id}`, data);
    } finally {
      setLoading(false);
    }
  }, [apiURL]);

  const del = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      return await http.delete(`${apiURL}/${id}`);
    } finally {
      setLoading(false);
    }
  }, [apiURL]);

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  return {
    items,
    loading,
    data,
    get,
    getOne,
    create,
    edit,
    del,
    clearData
  }
}

