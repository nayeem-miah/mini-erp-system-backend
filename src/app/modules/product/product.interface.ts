export interface ICreateProductPayload {
  name: string;
  categoryId: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  image: string;
}

export interface IProductQuery {
  page?: string;
  limit?: string;
  searchTerm?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IUpdateProductPayload {
  name?: string;
  categoryId?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  stockQuantity?: number;
  image?: string;
}
