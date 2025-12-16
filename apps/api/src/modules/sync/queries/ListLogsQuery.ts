export class ListLogsQuery {
  constructor(
    public readonly lojavirtual_id?: number,
    public readonly page: number = 1,
    public readonly limit: number = 50,
    public readonly tipo?: string
  ) {}
}



