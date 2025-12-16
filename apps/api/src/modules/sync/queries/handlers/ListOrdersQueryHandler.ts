import { ListOrdersQuery } from '../ListOrdersQuery';

export class ListOrdersQueryHandler {
  async handle(query: ListOrdersQuery) {
    // TODO: Implement orders listing
    // This will query from staging/integration tables
    return {
      data: [],
      total: 0,
      page: query.page,
      limit: query.limit,
      totalPages: 0,
    };
  }
}



