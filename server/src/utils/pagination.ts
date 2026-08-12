export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
  formatMeta: (totalItems: number) => PaginationMeta;
}

export const getPagination = (
  query: PaginationQuery,
  defaultLimit = 10,
  maxLimit = 100
): PaginationResult => {
  const page = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
  const rawLimit = parseInt(String(query.limit || defaultLimit), 10) || defaultLimit;
  const limit = Math.min(maxLimit, Math.max(1, rawLimit));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    formatMeta: (totalItems: number): PaginationMeta => {
      const totalPages = Math.ceil(totalItems / limit) || 1;
      return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    },
  };
};
