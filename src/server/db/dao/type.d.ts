export interface Page<T> {
  data: T[];
  page: {
    page: number;
    pageSize: number;
    total: number;
  }
}

export interface PageApiQuery {
  page: number;
  pageSize: number;
}

export interface OrderBy {
  [key: string]: 'asc' | 'desc';
}

export interface OrderByApiQuery {
  key: string;
  order: 'asc' | 'desc';
}

export interface PageDataBaseQuery {
  take: number;
  skip: number;
}
