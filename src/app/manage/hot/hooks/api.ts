import http from '@/http';
import {HotTopic} from "@prisma/client";

/**
 * 增删改查
 */
export const getHots = (params?: Partial<HotTopic>):Promise<HotTopic[]> => http.get('/hot', { params });

export const createHot = (data: Partial<HotTopic>) => http.post('/hot', data);

export const updateHot = (id: string, data: any) => http.put(`/hot/${id}`, data);

export const deleteHot = (id: string) => http.delete(`/hot/${id}`);

export const getHot = (id: string):Promise<HotTopic> => http.get(`/hot/${id}`);
