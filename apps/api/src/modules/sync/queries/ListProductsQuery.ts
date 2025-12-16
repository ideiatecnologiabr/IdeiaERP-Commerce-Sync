export class ListProductsQuery {
  constructor(
    public readonly lojavirtual_id: string,
    public readonly page: number = 1,
    public readonly limit: number = 50,
    public readonly search?: string
  ) {}
}

