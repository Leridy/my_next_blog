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

export interface PageDataBaseQuery {
  take: number;
  skip: number;
}
