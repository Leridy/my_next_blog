import {useCallback, useEffect, useState} from "react";
import {createHot, deleteHot, getHot, getHots, updateHot} from "./api";
import {HotTopic} from "@prisma/client";

export function useHotData() {
  const [hotList, setHotList] = useState<HotTopic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<HotTopic | null>(null);

  const fetch = useCallback(async (params?: Partial<HotTopic>) => {
    try {
      console.error('fetch', params);
      setLoading(true);
      const res = await getHots(params);
      setHotList(res);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOne = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await getHot(id);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (data: Partial<HotTopic>) => {
    try {
      setLoading(true);
      return await createHot(data);
    } finally {
      setLoading(false);
    }
  };

  const edit = useCallback(async (id: string, data: Partial<HotTopic>) => {
    try {
      setLoading(true);
      const res = await updateHot(id, data);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await deleteHot(id);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);


  return {
    hotList,
    data,
    loading,
    fetch,
    fetchOne,
    create,
    edit,
    remove
  }
}
